import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingEvents, getUpcomingRocketLaunches } from '../../web/nextspaceflight.adapter.js';

import { formatEvents } from './formatters/event-formatter.js';

const TOOL_NAME = 'fetchEventsForSpace';

const TOOL_DESCRIPTION = `
Fetches upcoming space missions and rocket launches within the next 5 days. No input required.
`.trim();

const TIMEFRAME_DAYS = 5;

export function createFetchEventsForSpaceTool(logger: LoggerPort): ToolPort {
    async function fetchEventsForSpace(): Promise<string> {
        logger.info('Fetching space events', { timeframe: `${TIMEFRAME_DAYS} days` });

        const [missions, launches] = await Promise.all([
            getUpcomingEvents(),
            getUpcomingRocketLaunches(),
        ]);

        const events = [...missions, ...launches];
        const filteredEvents = filterEventsByDateRange(events, TIMEFRAME_DAYS);

        logger.info('Retrieved space events', {
            filteredEvents: filteredEvents.length,
            timeframeDays: TIMEFRAME_DAYS,
            totalEvents: events.length,
        });

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
