import { tool } from '@langchain/core/tools';

import { getUpcomingTechEvents } from '../../adapters/outbound/web-scraper/techmeme-events.adapter.js';

export function createFetchTechEventsTool() {
    return tool(
        async (input: string) => {
            let events = await getUpcomingTechEvents();
            let filter: { eventType?: string[]; titleIncludes?: string[] } = {};
            try {
                if (input) {
                    const parsed = JSON.parse(input);
                    if (parsed && typeof parsed === 'object' && parsed.filter) {
                        filter = parsed.filter;
                    }
                }
            } catch (err) {
                console.error('Error parsing filter', err);
                // Ignore JSON parse errors and proceed with no filter
            }
            if (filter.eventType) {
                events = events.filter((e) => filter.eventType?.includes(e.eventType));
            }
            if (filter.titleIncludes) {
                events = events.filter((e) =>
                    filter.titleIncludes?.some((keyword) =>
                        e.title.toLowerCase().includes(keyword.toLowerCase()),
                    ),
                );
            }
            // Filter to only include events within the next 14 days
            const now = new Date();
            const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
            events = events.filter((e) => {
                const eventDate = new Date(e.date);
                return eventDate >= now && eventDate <= twoWeeksFromNow;
            });
            return JSON.stringify(events);
        },
        {
            description:
                'Fetches upcoming tech conferences from techmeme.com/events. Accepts optional filter: { filter: { eventType?: string[], titleIncludes?: string[] } }',
            name: 'getUpcomingTechEvents',
        },
    );
}
