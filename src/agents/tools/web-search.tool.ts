import { tool } from '@langchain/core/tools';

import { searchWeb } from '../../adapters/outbound/web-search/tavily.adapter.js';

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
