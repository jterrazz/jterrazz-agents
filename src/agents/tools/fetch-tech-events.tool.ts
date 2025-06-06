import { tool } from '@langchain/core/tools';

import { getUpcomingTechEvents } from '../../adapters/outbound/web/techmeme.adapter.js';

export function createFetchTechEventsTool() {
    return tool(
        async () => {
            let events = await getUpcomingTechEvents();
            // Filter to only include events within the next 14 days
            const now = new Date();
            const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
            events = events.filter((e) => {
                const eventDate = new Date(e.date);
                return eventDate >= now && eventDate <= twoWeeksFromNow;
            });
            return JSON.stringify(events);
        },
        {
            description:
                'Fetches the internet for a generic list of upcoming tech events within the next 14 days.',
            name: 'getUpcomingTechEvents',
        },
    );
}

export function withFetchTechEventsTool() {
    return 'Use the getUpcomingTechEvents tool to check on the internet for a generic list of upcoming tech events.';
}
