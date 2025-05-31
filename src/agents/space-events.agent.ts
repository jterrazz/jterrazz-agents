import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordEventsMarkdownFormat } from './templates/discord-space-events-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import {
    createFetchSpaceEventsTool,
    withFetchSpaceEventsTool,
} from './tools/fetch-space-events.tool.js';
import { createGetCurrentDateTool } from './tools/get-current-date.tool.js';

export function createSpaceEventsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Only update about Starship launches. And events categorized as "space mission". Ignore other events.
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
                    withFetchSpaceEventsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchSpaceEventsTool(),
            createGetCurrentDateTool(),
        ],
    });
    return agent;
}
