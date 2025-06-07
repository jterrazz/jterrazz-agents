import { type LoggerPort } from '@jterrazz/logger';
import { type DynamicTool } from 'langchain/tools';

import { type AvailableAgentTools } from '../../ports/outbound/agent.port.js';
import { type AIPort } from '../../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../../ports/outbound/chatbot.port.js';

import { withDiscordNewsMarkdownFormat } from '../templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from '../templates/system.js';

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

    constructor(dependencies: ChatAgentDependencies, agentSpecific: string) {
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
                ['system', buildSystemPrompt(agentSpecific, withDiscordNewsMarkdownFormat())],
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
