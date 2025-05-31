import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchAITweetsTool, useFetchAITweetsTool } from './tools/fetch-ai-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createAINewsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Only post about important news, discussions, or updates related to AI, machine learning, or the broader tech/AI ecosystem.
`;
    return createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    useDiscordNewsMarkdownFormat(),
                    useFetchAITweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchAITweetsTool(),
            createGetCurrentDateTool(),
        ],
    });
}
