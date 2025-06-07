import { afterEach, beforeEach, describe, expect, it, mockOfDate } from '@jterrazz/test';

import { EventTypeEnum } from '../../../../../../ports/outbound/web/events.port.js';

import { filterEventsByDateRange } from '../event-filters.js';

describe('event-filters', () => {
    describe('filterEventsByDateRange', () => {
        const now = new Date('2024-06-13T12:00:00.000Z');
        const tomorrow = new Date('2024-06-14T12:00:00.000Z');
        const nextWeek = new Date('2024-06-20T12:00:00.000Z');
        const nextMonth = new Date('2024-07-13T12:00:00.000Z');

        const events = [
            {
                date: now,
                eventType: EventTypeEnum.Conference,
                sourceUrl: 'https://test.com/1',
                title: 'Today Event',
            },
            {
                date: tomorrow,
                eventType: EventTypeEnum.Conference,
                sourceUrl: 'https://test.com/2',
                title: 'Tomorrow Event',
            },
            {
                date: nextWeek,
                eventType: EventTypeEnum.Conference,
                sourceUrl: 'https://test.com/3',
                title: 'Next Week Event',
            },
            {
                date: nextMonth,
                eventType: EventTypeEnum.Conference,
                sourceUrl: 'https://test.com/4',
                title: 'Next Month Event',
            },
        ];

        beforeEach(() => {
            mockOfDate.set(now);
        });

        afterEach(() => {
            mockOfDate.reset();
        });

        it('should filter events within the specified date range', () => {
            const filtered = filterEventsByDateRange(events, 7);
            expect(filtered).toHaveLength(3);
            expect(filtered.map((e) => e.title)).toEqual([
                'Today Event',
                'Tomorrow Event',
                'Next Week Event',
            ]);
        });

        it('should include events on the boundary dates', () => {
            const filtered = filterEventsByDateRange(events, 1);
            expect(filtered).toHaveLength(2);
            expect(filtered.map((e) => e.title)).toEqual(['Today Event', 'Tomorrow Event']);
        });

        it('should return empty array when no events are in range', () => {
            const filtered = filterEventsByDateRange(events, 0);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].title).toBe('Today Event');
        });

        it('should handle empty events array', () => {
            const filtered = filterEventsByDateRange([], 7);
            expect(filtered).toHaveLength(0);
        });
    });
});
