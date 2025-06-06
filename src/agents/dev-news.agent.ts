import type { LoggerPort } from '@jterrazz/logger';

import type { AIPort } from '../ports/outbound/ai.port.js';
import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchDevTweetsTool, withFetchDevTweetsTool } from './tools/fetch-dev-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createDevNewsAgent({
    ai,
    apifyToken,
    channelName,
    chatBot,
    logger,
}: {
    ai: AIPort;
    apifyToken: string;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Only post about important news, discussions, or updates related to software development, open source, or the broader dev ecosystem.
`;
    return createChatAgent({
        ai,
        logger,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    withDiscordNewsMarkdownFormat(),
                    withFetchDevTweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchDevTweetsTool(apifyToken),
            createGetCurrentDateTool(),
        ],
    });
}
