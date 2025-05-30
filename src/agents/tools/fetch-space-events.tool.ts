import { tool } from '@langchain/core/tools';

import {
    getUpcomingEvents,
    getUpcomingRocketLaunches,
} from '../../adapters/outbound/web-scraper/nextspaceflight.adapter.js';

export function createFetchSpaceEventsTool() {
    return tool(
        async (input: string) => {
            const [missions, launches] = await Promise.all([
                getUpcomingEvents(),
                getUpcomingRocketLaunches(),
            ]);
            let events = [...missions, ...launches];
            let filter: { eventType?: string[]; titleIncludes?: string[] } = {};
            try {
                if (input) {
                    const parsed = JSON.parse(input);
                    if (parsed && typeof parsed === 'object' && parsed.filter) {
                        filter = parsed.filter;
                    }
                }
            } catch {}
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
            return JSON.stringify(events);
        },
        {
            description:
                'Fetches upcoming space missions and rocket launches from nextspaceflight.com. Accepts optional filter: { filter: { eventType?: string[], titleIncludes?: string[] } }',
            name: 'getUpcomingSpaceEvents',
        },
    );
}
