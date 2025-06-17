import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingTechEvents } from '../../web/techmeme.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

const TOOL_NAME = 'fetchEventsForTechnology';

const TOOL_DESCRIPTION = `
Fetches upcoming technology events within the next 5 days. No input required.
`.trim();

const TIMEFRAME_DAYS = 5;

export function createFetchEventsForTechnologyTool(logger: LoggerPort): ToolPort {
    async function fetchEventsForTechnology(): Promise<string> {
        logger.info('Fetching technology events', { timeframe: `${TIMEFRAME_DAYS} days` });

        const events = await getUpcomingTechEvents();
        const filteredEvents = filterEventsByDateRange(events, TIMEFRAME_DAYS);

        logger.info('Retrieved technology events', {
            filteredEvents: filteredEvents.length,
            timeframeDays: TIMEFRAME_DAYS,
            totalEvents: events.length,
        });

        return formatEvents(filteredEvents);
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchEventsForTechnology,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
