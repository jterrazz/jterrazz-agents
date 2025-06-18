import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingEvents, getUpcomingRocketLaunches } from '../../providers/nextspaceflight.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

const TOOL_NAME = 'fetchEventsForSpace';

const TOOL_DESCRIPTION = `
Fetches upcoming space missions and rocket launches within the next 5 days. No input required.
`.trim();

const TIMEFRAME_DAYS = 5;

export function createFetchEventsForSpaceTool(logger: LoggerPort): ToolPort {
    async function fetchEventsForSpace(): Promise<string> {
        logger.info('Executing fetchEventsForSpace tool...');

        const [missions, launches] = await Promise.all([
            getUpcomingEvents(),
            getUpcomingRocketLaunches(),
        ]);

        const events = [...missions, ...launches];
        const filteredEvents = filterEventsByDateRange(events, TIMEFRAME_DAYS);

        if (filteredEvents.length === 0) {
            logger.info('No upcoming space events found.', { timeframeDays: TIMEFRAME_DAYS });
        } else {
            logger.info(`Found ${filteredEvents.length} upcoming space events.`, {
                count: filteredEvents.length,
                timeframeDays: TIMEFRAME_DAYS,
            });
        }

        return formatEvents(filteredEvents);
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchEventsForSpace,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
