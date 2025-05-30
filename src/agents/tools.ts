import { tool } from '@langchain/core/tools';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { getUpcomingEvents } from '../adapters/outbound/nextspaceflight-events.service.js';
import { searchWeb } from '../adapters/outbound/websearch.service.js';

export function createFetchRecentBotMessagesTool({ channelName, chatBot }: { channelName: string; chatBot: ChatBotPort; }) {
    return tool(
        async (_input: string) => {
            return JSON.stringify(await chatBot.getRecentBotMessages(channelName, 10));
        },
        {
            description: 'Fetches the most recent messages sent by the bot in the #space channel.',
            name: 'getRecentBotMessages',
        },
    );
}

export function createFetchSpaceEventsTool() {
    return tool(
        async (_input: string) => {
            return JSON.stringify(await getUpcomingEvents());
        },
        {
            description: 'Fetches upcoming space events.',
            name: 'getUpcomingEvents',
        },
    );
}

export function createWebSearchTool() {
    return tool(
        async (input: string) => {
            return JSON.stringify(await searchWeb(input));
        },
        {
            description: 'Performs a web search for up-to-date information.',
            name: 'searchWeb',
        },
    );
}
