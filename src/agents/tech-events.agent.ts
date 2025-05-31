import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordEventsMarkdownFormat } from './templates/discord-space-events-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import {
    createFetchTechEventsTool,
    withFetchTechEventsTool,
} from './tools/fetch-tech-events.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createTechEventsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
The audience is developers based in France. Only about these tech conferences: Apple, Google, Nvidia, Microsoft, AWS, CES).

You will have nothing to say most of the time, as most of the events happening are not related to that.
`;
    const agent = createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    useDiscordEventsMarkdownFormat(),
                    withFetchTechEventsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchTechEventsTool(),
            createGetCurrentDateTool(),
        ],
    });
    return agent;
}
