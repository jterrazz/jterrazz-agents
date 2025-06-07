import { type Event } from '../../../../../ports/outbound/web/events.port.js';

import { formatDate } from './date-formatter.js';

export const formatEvent = (event: Event): string => {
    const parts = [`Date: ${formatDate(event.date)}`, `Title: ${event.title}`];

    if (event.eventType) {
        parts.push(`Type: ${event.eventType}`);
    }

    if (event.description) {
        parts.push(`Description: ${event.description}`);
    }

    if (event.location) {
        parts.push(`Location: ${event.location}`);
    }

    parts.push(`Source: ${event.sourceUrl}`);

    return parts.join('\n');
};

export const formatEvents = (events: Event[]): string => {
    return events.map(formatEvent).join('\n\n');
};
