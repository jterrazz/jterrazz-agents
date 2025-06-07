import { DynamicTool } from 'langchain/tools';

import { getUpcomingTechEvents } from '../../web/techmeme.adapter.js';

import { filterEventsByDateRange } from './filters/event-filters.js';
import { formatEvents } from './formatters/event-formatter.js';

export const createFetchEventsForTechnologyTool = () =>
    new DynamicTool({
        description: 'Get recent technology events and conferences.',
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
