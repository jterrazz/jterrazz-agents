import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingTechEvents } from '../../providers/techmeme.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

const TOOL_NAME = 'fetchEventsForTechnology';

const TOOL_DESCRIPTION = `
Fetches upcoming technology events within the next 5 days. No input required.
`.trim();

const TIMEFRAME_DAYS = 5;

export function createFetchEventsForTechnologyTool(logger: LoggerPort): ToolPort {
    async function fetchEventsForTechnology(): Promise<string> {
        logger.info('Executing fetchEventsForTechnology tool...');

        const events = await getUpcomingTechEvents();
        const filteredEvents = filterEventsByDateRange(events, TIMEFRAME_DAYS);

        if (filteredEvents.length === 0) {
            logger.info('No upcoming technology events found.', { timeframeDays: TIMEFRAME_DAYS });
        } else {
            logger.info(`Found ${filteredEvents.length} upcoming technology events.`, {
                count: filteredEvents.length,
                timeframeDays: TIMEFRAME_DAYS,
            });
        }

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
