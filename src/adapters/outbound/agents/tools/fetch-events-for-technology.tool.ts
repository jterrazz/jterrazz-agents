import { type LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../../../../ports/outbound/agents.port.js';

import { filterEventsByDateRange } from './utils/event-filters.js';

import { getUpcomingTechEvents } from '../../web/techmeme.adapter.js';
import { createSafeAgentTool } from '../tool.js';

import { formatEvents } from './formatters/event-formatter.js';

export function createFetchEventsForTechnologyTool(logger: LoggerPort): AgentToolPort {
    return createSafeAgentTool(
        {
            description: 'Get technology events and conferences within the next 14 days.',
            name: 'fetchEventsForTechnology',
        },
        async () => {
            logger.info('Fetching technology events', { timeframe: '14 days' });

            const events = await getUpcomingTechEvents();
            const filteredEvents = filterEventsByDateRange(events, 14);

            logger.info('Retrieved technology events', {
                filteredEvents: filteredEvents.length,
                timeframeDays: 14,
                totalEvents: events.length,
            });

            return formatEvents(filteredEvents);
        },
        logger,
    );
}
