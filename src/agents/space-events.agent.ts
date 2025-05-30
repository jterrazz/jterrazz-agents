import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordEventsMarkdownFormat } from './templates/discord-space-events-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createFetchSpaceEventsTool } from './tools/fetch-space-events.tool.js';
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
Only update about upcoming space missions, Starship launches, and Blue Origin launches. Ignore other rocket launches.
When using the getUpcomingSpaceEvents tool, always pass the following filter as input: filter with eventType 'space-mission' and 'rocket-launch', and titleIncludes 'starship' or 'blue origin'.
Do not post the same information twice, even if the wording is slightly different.
`;
    const agent = createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            ['system', buildSystemPrompt(agentSpecific, useDiscordEventsMarkdownFormat())],
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
