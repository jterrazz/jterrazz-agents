import { type LoggerPort } from '@jterrazz/logger';
import { type DynamicTool } from 'langchain/tools';

import { type AvailableAgentTools } from '../../../../ports/outbound/agents.port.js';
import { type AIPort } from '../../../../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createChatAgent } from './chat-agent-factory.js';

export type ChatAgentDependencies = {
    ai: AIPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AvailableAgentTools;
};

export abstract class ChatAgent {
    protected readonly agent: ReturnType<typeof createChatAgent>;
    protected readonly ai: AIPort;
    protected readonly channelName: string;
    protected readonly chatBot: ChatBotPort;
    protected readonly logger: LoggerPort;
    protected readonly tools: AvailableAgentTools;

    constructor(dependencies: ChatAgentDependencies, systemPrompt: string) {
        this.ai = dependencies.ai;
        this.channelName = dependencies.channelName;
        this.chatBot = dependencies.chatBot;
        this.logger = dependencies.logger;
        this.tools = dependencies.tools;

        this.agent = createChatAgent({
            ai: this.ai,
            channelName: this.channelName,
            chatBot: this.chatBot,
            logger: this.logger,
            promptTemplate: [
                [
                    'system',
                    systemPrompt +
                        `
EXPECTED OUTPUT FORMAT:
- If you decide not to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "noop", "reason": "<your reason>" }} }}\n\u0060\u0060\u0060.
- If you decide to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "post", "content": "<the message to post>" }} }}\n\u0060\u0060\u0060.
- For tool calls, use: \u0060\u0060\u0060json\n{{ "action": <tool_name>, "action_input": <tool_input> }}\n\u0060\u0060\u0060.
- **Always output ONLY a valid JSON object. Do not include any code block, explanation, or formatting—just the JSON.**`,
                ],
                ['human', '{input}'],
            ],
            tools: this.getTools(),
        });
    }

    public async run(userQuery: string): Promise<void> {
        await this.agent.run(userQuery);
    }

    protected abstract getTools(): DynamicTool[];
}
