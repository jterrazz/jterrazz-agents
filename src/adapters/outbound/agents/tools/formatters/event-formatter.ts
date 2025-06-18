import { type Event } from '../../../../../ports/outbound/providers/events.port.js';

import { formatDate } from './date-formatter.js';

export const formatEvent = (event: Event): string => {
    let result = `Date: ${formatDate(event.date)}
Title: ${event.title}`;

    if (event.eventType) {
        result += `
Type: ${event.eventType}`;
    }

    if (event.description) {
        result += `
Description: ${event.description.replace(/\n/g, '\\n')}`;
    }

    if (event.location) {
        result += `
Location: ${event.location}`;
    }

    result += `
Source: ${event.sourceUrl}`;

    return result;
};

export const formatEvents = (events: Event[]): string => {
    if (events.length === 0) {
        return 'No recent events found.';
    }

    return events.map(formatEvent).join('\n\n');
};
