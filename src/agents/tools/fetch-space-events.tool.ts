import { tool } from '@langchain/core/tools';

import {
    getUpcomingEvents,
    getUpcomingRocketLaunches,
} from '../../adapters/outbound/web-scraper/nextspaceflight.adapter.js';

export function createFetchSpaceEventsTool() {
    return tool(
        async () => {
            const [missions, launches] = await Promise.all([
                getUpcomingEvents(),
                getUpcomingRocketLaunches(),
            ]);
            let events = [...missions, ...launches];
            // Filter to only include events within the next 5 days
            const now = new Date();
            const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
            events = events.filter((e) => {
                const eventDate = new Date(e.date);
                return eventDate >= now && eventDate <= fiveDaysFromNow;
            });
            return JSON.stringify(events);
        },
        {
            description:
                'Fetches upcoming space missions and rocket launches within the next 5 days.',
            name: 'getUpcomingSpaceEvents',
        },
    );
}
