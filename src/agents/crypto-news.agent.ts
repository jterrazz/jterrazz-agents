import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import {
    createFetchCryptoTweetsTool,
    withFetchCryptoTweetsTool,
} from './tools/fetch-crypto-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createCryptoNewsAgent({
    apiKey,
    channelName,
    chatBot,
    logger,
}: {
    apiKey: string;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Only post about important news, discussions or updates related to Bitcoin, Ethereum, or generic crypto topics.
`;
    return createChatAgent({
        apiKey,
        logger,
        modelConfig: undefined,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    withDiscordNewsMarkdownFormat(),
                    withFetchCryptoTweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchCryptoTweetsTool(),
            createGetCurrentDateTool(),
        ],
    });
}
