import { DynamicTool } from 'langchain/tools';

import { getUpcomingTechEvents } from '../../adapters/outbound/web/techmeme.adapter.js';

export const createFetchEventsForTechnologyTool = () =>
    new DynamicTool({
        description: 'Get recent technology events and conferences.',
        func: async () => {
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
        name: 'fetchEventsForTechnology',
    });

export function withFetchEventsForTechnologyTool() {
    return 'Use the fetchEventsForTechnology tool to get latest information about technology events and conferences.';
} 