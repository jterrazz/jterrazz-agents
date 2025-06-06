import { DynamicTool } from 'langchain/tools';

import {
    getUpcomingEvents,
    getUpcomingRocketLaunches,
} from '../../adapters/outbound/web/nextspaceflight.adapter.js';

export function createFetchSpaceEventsTool() {
    return new DynamicTool({
        description: 'Fetches upcoming space missions and rocket launches within the next 5 days.',
        func: async () => {
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
        name: 'getUpcomingSpaceEvents',
    });
}

export function withFetchSpaceEventsTool() {
    return 'Use the getUpcomingSpaceEvents tool to get latest information about space missions and rocket launches.';
}
