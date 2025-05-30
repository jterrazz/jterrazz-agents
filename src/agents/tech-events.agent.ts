import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordEventsMarkdownFormat } from './templates/discord-space-events-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createFetchTechEventsTool } from './tools/fetch-tech-events.tool.js';
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
Only update about major, well-known tech conferences and events that developers would care about (e.g., Apple WWDC, Google I/O, Nvidia GTC, Microsoft Build, AWS re:Invent, etc).
Use the getUpcomingTechEvents tool to get the latest information on the web.
When using the getUpcomingTechEvents tool, always pass a filter with eventType 'conference' and titleIncludes keywords like 'apple', 'google', 'nvidia', 'microsoft', 'aws', 'openai', 'meta', 'developer', 'summit', 'build', 'io', 'wwdc', 'gtc', 'ignite', 're:invent', 'unite', 'f8', 'connect', 'expo', 'conference'.
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
            createFetchTechEventsTool(),
            createGetCurrentDateTool(),
        ],
    });
    return agent;
}
