import { describe, expect, it } from '@jterrazz/test';

import { EventTypeEnum } from '../../../../../../ports/outbound/providers/events.port.js';

import { formatEvent, formatEvents } from '../event-formatter.js';

describe('event-formatter', () => {
    describe('formatEvent', () => {
        it('should format a complete event correctly', () => {
            const event = {
                date: new Date('2024-06-13T12:34:56.789Z'),
                description: 'Test Description',
                eventType: EventTypeEnum.Conference,
                location: 'Test Location',
                sourceUrl: 'https://test.com',
                title: 'Test Event',
            };

            const formatted = formatEvent(event);
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM\n' +
                    'Title: Test Event\n' +
                    'Type: conference\n' +
                    'Description: Test Description\n' +
                    'Location: Test Location\n' +
                    'Source: https://test.com',
            );
        });

        it('should format an event with minimal fields', () => {
            const event = {
                date: new Date('2024-06-13T12:34:56.789Z'),
                eventType: EventTypeEnum.Conference,
                sourceUrl: 'https://test.com',
                title: 'Test Event',
            };

            const formatted = formatEvent(event);
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM\n' +
                    'Title: Test Event\n' +
                    'Type: conference\n' +
                    'Source: https://test.com',
            );
        });

        it('should handle optional fields correctly', () => {
            const event = {
                date: new Date('2024-06-13T12:34:56.789Z'),
                description: 'Test Description',
                eventType: EventTypeEnum.Conference,
                sourceUrl: 'https://test.com',
                title: 'Test Event',
            };

            const formatted = formatEvent(event);
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM\n' +
                    'Title: Test Event\n' +
                    'Type: conference\n' +
                    'Description: Test Description\n' +
                    'Source: https://test.com',
            );
        });
    });

    describe('formatEvents', () => {
        it('should format multiple events with proper spacing', () => {
            const events = [
                {
                    date: new Date('2024-06-13T12:34:56.789Z'),
                    eventType: EventTypeEnum.Conference,
                    sourceUrl: 'https://test.com/1',
                    title: 'Event 1',
                },
                {
                    date: new Date('2024-06-14T12:34:56.789Z'),
                    eventType: EventTypeEnum.Conference,
                    sourceUrl: 'https://test.com/2',
                    title: 'Event 2',
                },
            ];

            const formatted = formatEvents(events);
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM\n' +
                    'Title: Event 1\n' +
                    'Type: conference\n' +
                    'Source: https://test.com/1\n\n' +
                    'Date: June 14, 2024 at 12:34 PM\n' +
                    'Title: Event 2\n' +
                    'Type: conference\n' +
                    'Source: https://test.com/2',
            );
        });

        it('should handle empty events array', () => {
            const events: Array<{
                date: Date;
                eventType: EventTypeEnum;
                sourceUrl: string;
                title: string;
            }> = [];

            const formatted = formatEvents(events);
            expect(formatted).toBe('No recent events found.');
        });
    });
});
