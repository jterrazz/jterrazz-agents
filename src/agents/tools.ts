import { tool } from '@langchain/core/tools';

import { getRecentBotMessages } from '../adapters/discord-messages.service.js';
import { getUpcomingEvents } from '../adapters/nextspaceflight-events.service.js';
import { searchWeb } from '../adapters/websearch.service.js';

import { channelName, client } from '../index.js';

export const fetchSpaceEventsTool = tool(
    async (_input: string) => {
        return JSON.stringify(await getUpcomingEvents());
    },
    {
        description: 'Fetches upcoming space events.',
        name: 'getUpcomingEvents',
    },
);

export const webSearchTool = tool(
    async (input: string) => {
        return JSON.stringify(await searchWeb(input));
    },
    {
        description: 'Performs a web search for up-to-date information.',
        name: 'searchWeb',
    },
);

export const fetchRecentBotMessagesTool = tool(
    async (_input: string) => {
        // Fetch the last 10 bot messages from the #space channel
        return JSON.stringify(await getRecentBotMessages({ channelName, client, limit: 10 }));
    },
    {
        description: 'Fetches the most recent messages sent by the bot in the #space channel.',
        name: 'getRecentBotMessages',
    },
); 