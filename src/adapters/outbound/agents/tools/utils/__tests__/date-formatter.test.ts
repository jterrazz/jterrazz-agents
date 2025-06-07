import { describe, expect, it } from '@jterrazz/test';

import { formatDate } from '../date-formatter.js';

describe('formatDate', () => {
    it('should format a Date object correctly', () => {
        const date = new Date('2024-06-13T12:34:56.789Z');
        const formatted = formatDate(date);
        expect(formatted).toBe('June 13, 2024 at 12:34 PM');
    });

    it('should format a date string correctly', () => {
        const dateStr = '2024-06-13T12:34:56.789Z';
        const formatted = formatDate(dateStr);
        expect(formatted).toBe('June 13, 2024 at 12:34 PM');
    });

    it('should handle different times of day', () => {
        const morning = new Date('2024-06-13T08:15:00.000Z');
        const evening = new Date('2024-06-13T20:45:00.000Z');

        expect(formatDate(morning)).toBe('June 13, 2024 at 8:15 AM');
        expect(formatDate(evening)).toBe('June 13, 2024 at 8:45 PM');
    });

    it('should handle different months', () => {
        const january = new Date('2024-01-15T12:00:00.000Z');
        const december = new Date('2024-12-15T12:00:00.000Z');

        expect(formatDate(january)).toBe('January 15, 2024 at 12:00 PM');
        expect(formatDate(december)).toBe('December 15, 2024 at 12:00 PM');
    });
});
