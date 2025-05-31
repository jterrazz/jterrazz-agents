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
The audience is developers based in France. Only update about major, well-known tech conferences (e.g., Apple WWDC, Google I/O, Nvidia GTC, Microsoft Build, AWS re:Invent, CES, and super important European/French events). Some local events like CES outside France can be interesting but only if they are globally significant.

Do NOT include niche or vertical-specific conferences like Snowflake Summit, Databricks Data + AI Summit, or similar. Ignore events focused on a single SaaS, cloud, or data vendor unless they are truly global and relevant to all devs.
Do not hesitate to have no response, or a very few of events if there are no relevant events.

Focus on generic developer events, big tech company conferences, and major crypto/blockchain events.
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
