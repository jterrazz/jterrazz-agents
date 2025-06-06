import type { LoggerPort } from '@jterrazz/logger';

import type { AIPort } from '../ports/outbound/ai.port.js';
import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';
import type { Tool } from '../ports/outbound/tool.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { withFetchFinanceNewsTool } from './tools/fetch-finance-news.tool.js';

export type FinanceNewsAgentDependencies = {
    ai: AIPort;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: Tool[];
};

export const createFinanceNewsAgent = ({
    ai,
    chatBot,
    logger,
    tools,
}: FinanceNewsAgentDependencies) => {
    const agentSpecific = `
Only post about important news, discussions or updates related to financial topics.
`;

    return createChatAgent({
        ai,
        chatBot,
        logger,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    withDiscordNewsMarkdownFormat(),
                    withFetchFinanceNewsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools,
    });
};
