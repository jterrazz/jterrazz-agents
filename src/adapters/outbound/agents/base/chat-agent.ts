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
    message: z.string().max(2000).optional(),
    reason: z.string().optional(),
    shouldTransmitMessage: z.boolean(),
});

const OUTPUT_FORMAT_PROMPT =
    `
You are an agent that can talk in a chat room, the conversation is piloted by the langchain framework.

You have access to the following tools, that you can use based on the information you need: {tools}
Tool names: {tool_names}
Agent scratchpad: {agent_scratchpad}
` +
    `

When you want to provide your final response (not use a tool), you MUST format it exactly like this:

\`\`\`json
{{"action": "Final Answer", "action_input": {{"shouldTransmitMessage": false, "reason": "<your reason>"}}}}
\`\`\`

OR 

\`\`\`json
{{"action": "Final Answer", "action_input": {{"shouldTransmitMessage": true, "message": "<the message to send to the chat room>"}}}}
\`\`\`

ALWAYS use this exact format with markdown code blocks and the action/action_input structure.

<INFORMATION_SOURCE>
Use the tools at your disposal to get information needed from the world.
- I trust most of the sources i'm providing you, it is mostly reliable.
- DO NOT hallucinate, DO NOT make up information, DO use the tools to get the current up to date information.
</INFORMATION_SOURCE>
`;

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
        return [OUTPUT_FORMAT_PROMPT, agentPrompt, ...prompts].join('\n');
    }

    private createAgent({
        ai,
        logger,
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

        const handleResponse = async (response: AgentResponse): Promise<void> => {
            if (response.shouldTransmitMessage && response.message) {
                await this.chatBot.sendMessage(this.channelName, response.message);
                this.logger.info(`Message sent to #${this.channelName}`, { agent: this.name });
                return;
            }

            if (!response.shouldTransmitMessage) {
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

            // First try to extract from markdown code blocks (primary expected format)
            const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
            if (codeBlockMatch) {
                const content = codeBlockMatch[1].trim();

                try {
                    const parsed = JSON.parse(content);
                    // Check if it's the new format with action/action_input
                    if (parsed.action === 'Final Answer' && parsed.action_input) {
                        return parsed.action_input;
                    }
                    // Fallback to the entire parsed content
                    return parsed;
                } catch {
                    // Continue to other fallbacks
                }

                // Check if it contains "Final Answer:" pattern (legacy support)
                if (content.includes('Final Answer:')) {
                    const finalAnswerMatch = content.match(/Final Answer:\s*([\s\S]*?)$/i);
                    if (finalAnswerMatch) {
                        try {
                            return JSON.parse(finalAnswerMatch[1].trim());
                        } catch {
                            // Continue to fallback
                        }
                    }
                }
            }

            // Fallback: Look for plain "Final Answer:" pattern
            if (text.includes('Final Answer:')) {
                const actionInputMatch = text.match(/Final Answer:\s*([\s\S]*?)$/i);
                if (actionInputMatch) {
                    try {
                        return JSON.parse(actionInputMatch[1].trim());
                    } catch {
                        // Continue to final fallback
                    }
                }
            }

            // Final fallback: try parsing entire text as JSON
            try {
                return JSON.parse(text);
            } catch {
                return null;
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

                logger.debug('Agent execution result', {
                    hasOutput: 'output' in result,
                    outputType: typeof result.output,
                    result: JSON.stringify(result, null, 2),
                });

                if (!result || typeof result.output === 'undefined') {
                    throw new Error(
                        `Agent returned invalid result structure: ${JSON.stringify(result)}`,
                    );
                }

                const extractedJson = extractJson(result.output);
                const parsed = AgentResponseSchema.safeParse(extractedJson);

                if (!parsed.success) {
                    logger.error('Failed to parse agent response', {
                        extractedJson,
                        parseError: parsed.error,
                        rawOutput: result.output,
                    });
                    throw new Error(`Invalid agent response: ${JSON.stringify(parsed.error)}`);
                }

                await handleResponse(parsed.data);
            },
        };
    }
}
