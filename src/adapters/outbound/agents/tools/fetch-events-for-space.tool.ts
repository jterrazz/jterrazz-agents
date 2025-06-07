import { type LoggerPort } from '@jterrazz/logger';
import { DynamicTool } from 'langchain/tools';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingEvents, getUpcomingRocketLaunches } from '../../web/nextspaceflight.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

export function createFetchEventsForSpaceTool(logger: LoggerPort) {
    return new DynamicTool({
        description: 'Fetches upcoming space missions and rocket launches within the next 5 days.',
        func: async () => {
            logger.info('Fetching space events', { timeframe: '5 days' });

            const [missions, launches] = await Promise.all([
                getUpcomingEvents(),
                getUpcomingRocketLaunches(),
            ]);

            const events = [...missions, ...launches];
            const filteredEvents = filterEventsByDateRange(events, 5);

            logger.info('Retrieved space events', {
                filteredEvents: filteredEvents.length,
                timeframeDays: 5,
                totalEvents: events.length,
            });

            return formatEvents(filteredEvents);
        },
        name: 'fetchEventsForSpace',
    });
}
