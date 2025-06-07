import { type LoggerPort } from '@jterrazz/logger';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';
import { type DynamicTool } from 'langchain/tools';
import { z } from 'zod';

import { type AvailableAgentTools } from '../../../../ports/outbound/agents.port.js';
import { type AIPort } from '../../../../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { withGoogleAIRateLimit } from '../../ai/google-ai-rate-limiter.js';

export type ChatAgentDependencies = {
    ai: AIPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AvailableAgentTools;
};

const AgentResponseSchema = z.object({
    response: z.object({
        action: z.enum(['post', 'noop']),
        content: z.string().max(2000).optional(),
        reason: z.string().optional(),
    }),
});

type NewsAgentOptions = {
    ai: AIPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger?: LoggerPort;
    promptTemplate: Array<[string, string]>;
    tools: Array<DynamicTool<string>>;
};

export abstract class ChatAgent {
    protected readonly agent: ReturnType<typeof this.createAgent>;
    protected readonly ai: AIPort;
    protected readonly channelName: string;
    protected readonly chatBot: ChatBotPort;
    protected readonly logger: LoggerPort;
    protected readonly name: string;
    protected readonly tools: AvailableAgentTools;

    constructor(
        dependencies: ChatAgentDependencies,
        agentPrompt: string,
        prompts: string[],
        name: string,
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
        const result = await this.agent.run(userQuery);
        const extractedJson = this.extractJson(result);
        const parsed = AgentResponseSchema.safeParse(extractedJson);

        if (!parsed.success) {
            this.logger.error('Invalid agent response', { agent: this.name, error: parsed.error });
            return;
        }

        const { response } = parsed.data;

        if (response.action === 'post' && response.content) {
            await this.chatBot.sendMessage(this.channelName, response.content);
            this.logger.info(`Message sent to #${this.channelName}`, { agent: this.name });
        } else if (response.action === 'noop') {
            this.logger.info('Noop action', { agent: this.name, reason: response.reason });
        } else {
            this.logger.error('Unknown agent action', { agent: this.name, response });
        }
    }

    protected abstract getTools(): DynamicTool[];

    private buildSystemPrompt(agentPrompt: string, prompts: string[]): string {
        const expectedOutputFormat = `
EXPECTED OUTPUT FORMAT:
- If you decide not to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "response": {{ "action": "noop", "reason": "<your reason>" }} }}\n\u0060\u0060\u0060.
- If you decide to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "response": {{ "action": "post", "content": "<the message to post>" }} }}\n\u0060\u0060\u0060.
- For tool calls, use: \u0060\u0060\u0060json\n{{ "action": <tool_name>, "response": <tool_input> }}\n\u0060\u0060\u0060.
- **Always output ONLY a valid JSON object. Do not include any code block, explanation, or formatting—just the JSON.**

AGENT PROMPT:
${agentPrompt}

${prompts.join('\n')}`;

        return expectedOutputFormat;
    }

    private createAgent({ ai, promptTemplate, tools }: NewsAgentOptions) {
        const model = ai.getModel();
        const prompt = ChatPromptTemplate.fromMessages(promptTemplate);
        let executor: AgentExecutor | null = null;

        return {
            async run(userQuery: string): Promise<string> {
                if (!executor) {
                    const agent = await createStructuredChatAgent({
                        llm: model,
                        prompt,
                        tools,
                    });
                    executor = AgentExecutor.fromAgentAndTools({ agent, tools });
                }
                const result = await withGoogleAIRateLimit(() =>
                    executor!.invoke({ input: userQuery }),
                );
                return result.output;
            },
        };
    }

    private extractJson(text: unknown): unknown {
        if (typeof text === 'object' && text !== null) return text;
        if (typeof text === 'string') {
            const match = text.match(/```json\s*([\s\S]*?)```/i);
            const jsonString = match ? match[1] : text;
            try {
                return JSON.parse(jsonString);
            } catch (_e) {
                return null;
            }
        }
        return null;
    }
}
