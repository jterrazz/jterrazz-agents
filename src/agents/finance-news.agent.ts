import type { LoggerPort } from '@jterrazz/logger';

import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import {
    createFetchFinancialTweetsTool,
    withFetchFinancialTweetsTool,
} from './tools/fetch-financial-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export type FinanceNewsAgentDependencies = {
    ai: AIPort;
    apifyToken: string;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createFinanceNewsAgent = ({
    ai,
    apifyToken,
    channelName,
    chatBot,
    logger,
}: FinanceNewsAgentDependencies) => {
    const agentSpecific = `
Only post about important news, discussions or updates related to financial topics.
`;
    const tools = [
        createFetchRecentBotMessagesTool({ channelName, chatBot }),
        createFetchFinancialTweetsTool(apifyToken),
        createGetCurrentDateTool(),
    ];

    return createChatAgent({
        ai,
        logger,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    withDiscordNewsMarkdownFormat(),
                    withFetchFinancialTweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools,
    });
};
