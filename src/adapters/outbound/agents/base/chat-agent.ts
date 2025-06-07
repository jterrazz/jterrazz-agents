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

const OUTPUT_FORMAT_PROMPT = `
<FINAL-ANSWER-OUTPUT-FORMAT>
\`\`\`json
Final Answer: ${JSON.stringify(z.toJSONSchema(AgentResponseSchema), null, 2)}
\`\`\`
</FINAL-ANSWER-OUTPUT-FORMAT>

<FINAL-ANSWER-OUTPUT-FORMAT-RULES>
- **Always wrap your final answer in markdown code blocks**
- When you want to give a final answer (not use a tool), respond with:
\`\`\`json
Final Answer: {"shouldTransmitMessage": false, "reason": "<your reason>"}
\`\`\`
or
\`\`\`
Final Answer: {"shouldTransmitMessage": true, "message": "<the message to give to the user>"}
\`\`\`
</FINAL-ANSWER-OUTPUT-FORMAT-RULES>
`
    .replaceAll('{', '{{')
    .replaceAll('}', '}}');

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
${OUTPUT_FORMAT_PROMPT}

AGENT PROMPT:
${agentPrompt}

${prompts.join('\n')}`;

        return expectedOutputFormat;
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

                // Check if it contains "Final Answer:" pattern
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

                // Try parsing the entire code block content as JSON
                try {
                    return JSON.parse(content);
                } catch {
                    // Continue to fallback
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
