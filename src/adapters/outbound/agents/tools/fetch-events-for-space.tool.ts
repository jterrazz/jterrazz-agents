import { DynamicTool } from 'langchain/tools';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingEvents, getUpcomingRocketLaunches } from '../../web/nextspaceflight.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

export function createFetchEventsForSpaceTool() {
    return new DynamicTool({
        description: 'Fetches upcoming space missions and rocket launches within the next 5 days.',
        func: async () => {
            const [missions, launches] = await Promise.all([
                getUpcomingEvents(),
                getUpcomingRocketLaunches(),
            ]);
            const events = [...missions, ...launches];
            const filteredEvents = filterEventsByDateRange(events, 5);
            return formatEvents(filteredEvents);
        },
        name: 'fetchEventsForSpace',
    });
}

export function withFetchEventsForSpaceTool() {
    return 'Use the fetchEventsForSpace tool to get latest information about space missions and rocket launches.';
}
