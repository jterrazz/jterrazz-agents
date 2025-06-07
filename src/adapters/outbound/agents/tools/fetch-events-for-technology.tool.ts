import { DynamicTool } from 'langchain/tools';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingTechEvents } from '../../web/techmeme.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

export const createFetchEventsForTechnologyTool = () =>
    new DynamicTool({
        description: 'Get technology events and conferences within the next 14 days.',
        func: async () => {
            const events = await getUpcomingTechEvents();
            const filteredEvents = filterEventsByDateRange(events, 14);
            return formatEvents(filteredEvents);
        },
        name: 'fetchEventsForTechnology',
    });

export function withFetchEventsForTechnologyTool() {
    return 'Use the fetchEventsForTechnology tool to get latest information about technology events and conferences.';
}
