import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { buildSystemPrompt } from './base/prompt-rules.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createFetchSpaceEventsTool } from './tools/fetch-space-events.tool.js';
import { createWebSearchTool } from './tools/web-search.tool.js';

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

When listing upcoming space events, use this beautiful and modern Discord Markdown template for each event:

**<title>**

_A quick note: add a short, friendly, human-like sentence here to introduce the event (e.g., "Here's what you need to know about this event:" or something natural and welcoming)._ 

> 🗓️ **Date:** <date>
> 📍 **Location:** <location>
> 📝 **Description:** <description>

<#if imageUrl>[O](<imageUrl>)<#/if>

- Add a blank line between events.
- Do not repeat the event title anywhere except as the bolded title.
- Do not include a global title or heading; only output the event list.
- Use blockquotes for event details for clarity and visual separation.
- Use emoji for each field for visual appeal.
- If an image URL is available, show it as an embedded image below the event details.
`;
    const agent = createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(agentSpecific),
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchSpaceEventsTool(),
            createWebSearchTool(),
        ],
    });
    return agent;
}
