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

export type InvestNewsAgentDependencies = {
    ai: AIPort;
    apifyToken: string;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createInvestNewsAgent = ({
    ai,
    apifyToken,
    channelName,
    chatBot,
    logger,
}: InvestNewsAgentDependencies) => {
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
