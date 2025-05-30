import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchFinancialTweetsTool } from './tools/fetch-financial-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createInvestNewsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Only post about important news, discussions or updates related to financial topics.
Use the fetchFinancialTweets tool to get information on what to post about.
`;
    const agent = createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            ['system', buildSystemPrompt(agentSpecific, useDiscordNewsMarkdownFormat())],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchFinancialTweetsTool(),
            createGetCurrentDateTool(),
        ],
    });
    return agent;
}
