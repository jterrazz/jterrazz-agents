import { type Event } from '../../../../../ports/outbound/providers/events.port.js';

export const filterEventsByDateRange = (events: Event[], daysFromNow: number): Event[] => {
    const now = new Date();
    const endDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    return events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= endDate;
    });
};
