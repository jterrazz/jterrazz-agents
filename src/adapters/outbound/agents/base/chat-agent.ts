import { type LoggerPort } from '@jterrazz/logger';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { type DynamicTool } from 'langchain/tools';
import { z } from 'zod/v4';

import {
    type AgentPort,
    type AvailableAgentTools,
} from '../../../../ports/outbound/agents.port.js';
import { type AIPort } from '../../../../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { withGoogleAIRateLimit } from '../../ai/google-ai-rate-limiter.js';

export type AgentResponse = z.infer<typeof AgentResponseSchema>;

// Types
export type ChatAgentDependencies = {
    ai: AIPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AvailableAgentTools;
};

// Schemas
const AgentResponseSchema = z.object({
    response: z.object({
        action: z.enum(['post', 'noop']),
        content: z.string().max(2000).nullish(),
        reason: z.string().nullish(),
    }),
});

export abstract class ChatAgent {
    protected readonly agent: AgentPort;
    protected readonly ai: AIPort;
    protected readonly channelName: string;
    protected readonly chatBot: ChatBotPort;
    protected readonly logger: LoggerPort;
    protected readonly name: string;
    protected readonly tools: AvailableAgentTools;

    constructor(
        dependencies: ChatAgentDependencies,
        name: string,
        agentPrompt: string,
        prompts: string[],
    ) {
        this.ai = dependencies.ai;
        this.channelName = dependencies.channelName;
        this.chatBot = dependencies.chatBot;
        this.logger = dependencies.logger;
        this.tools = dependencies.tools;
        this.name = name;

        const systemPrompt = this.buildSystemPrompt(agentPrompt, prompts);

        this.agent = this.createAgent({
            ai: this.ai,
            channelName: this.channelName,
            chatBot: this.chatBot,
            logger: this.logger,
            promptTemplate: [
                ['system', systemPrompt],
                ['human', '{input}'],
            ],
            tools: this.getTools(),
        });
    }

    public async run(userQuery: string): Promise<void> {
        try {
            await this.agent.run(userQuery);
        } catch (error) {
            this.logger.error('Error running agent', {
                agent: this.name,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    protected abstract getTools(): DynamicTool[];

    private buildSystemPrompt(agentPrompt: string, prompts: string[]): string {
        const expectedOutputFormat = `
EXPECTED OUTPUT FORMAT:
\u0060\u0060\u0060json
${JSON.stringify(z.toJSONSchema(AgentResponseSchema), null, 4).replaceAll('{', '{{').replaceAll('}', '}}')}
\u0060\u0060\u0060

IMPORTANT RESPONSE FORMAT RULES:
- When you want to use a tool, respond with: Action: <tool_name>
Action Input: <tool_input>
- When you want to give a final answer (not use a tool), respond with: Final Answer: followed by the JSON object
- For final "noop" responses: Final Answer: {{"response": {{"action": "noop", "reason": "<your reason>"}}}}
- For final "post" responses: Final Answer: {{"response": {{"action": "post", "content": "<the message to post>"}}}}
- **NEVER mix tool usage syntax with final answer syntax**

AGENT PROMPT:
${agentPrompt}

${prompts.join('\n')}`;

        return expectedOutputFormat;
    }

    private createAgent({
        ai,
        promptTemplate,
        tools,
    }: {
        ai: AIPort;
        channelName: string;
        chatBot: ChatBotPort;
        logger: LoggerPort;
        promptTemplate: Array<[string, string]>;
        tools: Array<DynamicTool<string>>;
    }): AgentPort {
        const model = ai.getModel();
        const prompt = ChatPromptTemplate.fromMessages(promptTemplate);
        let executor: AgentExecutor | null = null;

        const handleResponse = async (response: AgentResponse['response']): Promise<void> => {
            if (response.action === 'post' && response.content) {
                await this.chatBot.sendMessage(this.channelName, response.content);
                this.logger.info(`Message sent to #${this.channelName}`, { agent: this.name });
                return;
            }

            if (response.action === 'noop') {
                this.logger.info('Noop action', {
                    agent: this.name,
                    reason: response.reason,
                });
                return;
            }

            this.logger.error('Unknown agent action', {
                agent: this.name,
                response,
            });
        };

        const extractJson = (text: unknown): unknown => {
            if (typeof text === 'object' && text !== null) {
                return text;
            }

            if (typeof text !== 'string') {
                return null;
            }

            // Handle "Final Answer:" prefix from StructuredChatAgent
            let cleanText = text;
            if (text.includes('Final Answer:')) {
                const finalAnswerMatch = text.match(/Final Answer:\s*([\s\S]*?)$/i);
                if (finalAnswerMatch) {
                    cleanText = finalAnswerMatch[1].trim();
                }
            }

            try {
                // First try to parse the entire string as JSON
                return JSON.parse(cleanText);
            } catch {
                // If that fails, try to extract JSON from code blocks
                const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/i);
                if (!match) {
                    return null;
                }

                try {
                    return JSON.parse(match[1].trim());
                } catch {
                    return null;
                }
            }
        };

        return {
            async run(userQuery: string): Promise<void> {
                if (!executor) {
                    const agent = await createStructuredChatAgent({
                        llm: model,
                        prompt,
                        tools,
                    });
                    executor = AgentExecutor.fromAgentAndTools({
                        agent,
                        tools,
                    });
                }

                const result = await withGoogleAIRateLimit(() =>
                    executor!.invoke({ input: userQuery }),
                );
                const extractedJson = extractJson(result.output);
                const parsed = AgentResponseSchema.safeParse(extractedJson);

                if (!parsed.success) {
                    throw new Error(`Invalid agent response: ${JSON.stringify(parsed.error)}`);
                }

                await handleResponse(parsed.data.response);
            },
        };
    }
}
