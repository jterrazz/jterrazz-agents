import { type LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../../../../ports/outbound/agents.port.js';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingEvents, getUpcomingRocketLaunches } from '../../web/nextspaceflight.adapter.js';
import { createSafeAgentTool } from '../tool.js';

import { formatEvents } from './formatters/event-formatter.js';

export function createFetchEventsForSpaceTool(logger: LoggerPort): AgentToolPort {
    return createSafeAgentTool(
        {
            description:
                'Fetches upcoming space missions and rocket launches within the next 5 days.',
            name: 'fetchEventsForSpace',
        },
        async () => {
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
        logger,
    );
}
