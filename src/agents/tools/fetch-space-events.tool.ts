import { tool } from '@langchain/core/tools';

import { getUpcomingEvents } from '../../adapters/outbound/web/nextspaceflight-web.adapter.js';

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