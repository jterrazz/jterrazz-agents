import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

import { getUpcomingEvents } from '../infrastructure/nextspaceflight-events.service.js';
import { searchWeb } from '../infrastructure/websearch.service.js';

const fetchEventsTool = tool(
    async () => {
        return JSON.stringify(await getUpcomingEvents());
    },
    {
        description: 'Fetches upcoming space events from NextSpaceflight.',
        name: 'getUpcomingEvents',
        schema: z.object({}),
    },
);

const webSearchTool = tool(
    async ({ query }: { query: string }) => {
        return JSON.stringify(await searchWeb(query));
    },
    {
        description: 'Performs a web search for up-to-date information.',
        name: 'searchWeb',
        schema: z.object({
            query: z.string().describe('The search query to use.'),
        }),
    },
);

const model = new ChatGoogleGenerativeAI({
    maxOutputTokens: 2048,
    model: 'gemini-2.5-flash-preview-05-20',
});

const modelWithTools = model.bindTools([fetchEventsTool, webSearchTool]);

export async function runEventsAgent(userQuery: string): Promise<string> {
    const res = await modelWithTools.invoke(userQuery);
    console.log(res);
    if (Array.isArray(res.content)) {
        return res.content
            .map((part) => {
                if (typeof part === 'string') return part;
                if (typeof part === 'object' && 'text' in part && typeof part.text === 'string')
                    return part.text;
                return '';
            })
            .join(' ');
    }
    return typeof res.content === 'string' ? res.content : '';
}
