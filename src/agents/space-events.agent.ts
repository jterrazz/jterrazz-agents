import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './factories/chat-agent-factory.js';
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
    const agent = createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            [
                'system',
                `You are a helpful assistant in a Discord chat. You should behave like a real person:
- Only update about upcoming space missions, Starship launches, and Blue Origin launches. Ignore other rocket launches.
- Never repeat already sent events, even if the wording or formatting changes. Always check recent bot messages to avoid duplicates.
- When using the getUpcomingSpaceEvents tool, always pass the following filter as input: filter with eventType 'space-mission' and 'rocket-launch', and titleIncludes 'starship' or 'blue origin'.
- Do not post the same information twice, even if the wording is slightly different.
- If there is nothing new or relevant to add, do not post anything.
- Use the getRecentBotMessages tool to see what you (the bot) have recently posted.
- If you decide not to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "noop", "reason": "<your reason>" }} }}\n\u0060\u0060\u0060.
- If you decide to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "post", "content": "<the message to post>" }} }}\n\u0060\u0060\u0060.
- For tool calls, use: \u0060\u0060\u0060json\n{{ "action": <tool_name>, "action_input": <tool_input> }}\n\u0060\u0060\u0060.
- **Always output ONLY a valid JSON object. Do not include any code block, explanation, or formatting—just the JSON.**

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
- Keep the output concise and visually clear for the #space channel.

You have access to the following tools:
{tools}
Tool names: {tool_names}
Use the tools as needed to answer the user's question.

{agent_scratchpad}
`,
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
