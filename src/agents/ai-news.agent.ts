import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchAITweetsTool, withFetchAITweetsTool } from './tools/fetch-ai-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createAINewsAgent({
    apifyToken,
    channelName,
    chatBot,
    googleApiKey,
    logger,
}: {
    apifyToken: string;
    channelName: string;
    chatBot: ChatBotPort;
    googleApiKey: string;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Only post about important news, discussions, or updates related to AI, machine learning, or the broader tech/AI ecosystem.
`;
    return createChatAgent({
        apiKey: googleApiKey,
        logger,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    withDiscordNewsMarkdownFormat(),
                    withFetchAITweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchAITweetsTool(apifyToken),
            createGetCurrentDateTool(),
        ],
    });
}
