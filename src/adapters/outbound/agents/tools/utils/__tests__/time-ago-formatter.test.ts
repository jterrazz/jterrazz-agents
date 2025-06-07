import { describe, expect, it } from '@jterrazz/test';

import { formatTimeAgo } from '../time-ago-formatter.js';

describe('formatTimeAgo', () => {
    it('should format seconds ago correctly', () => {
        const now = new Date();
        const secondsAgo = new Date(now.getTime() - 30 * 1000);
        expect(formatTimeAgo(secondsAgo)).toBe('posted 30 seconds ago');
    });

    it('should format minutes ago correctly', () => {
        const now = new Date();
        const minutesAgo = new Date(now.getTime() - 45 * 60 * 1000);
        expect(formatTimeAgo(minutesAgo)).toBe('posted 45 minutes ago');
    });

    it('should format hours ago correctly', () => {
        const now = new Date();
        const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
        expect(formatTimeAgo(hoursAgo)).toBe('posted 5 hours ago');
    });

    it('should format days ago correctly', () => {
        const now = new Date();
        const daysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(daysAgo)).toBe('posted 3 days ago');
    });

    it('should format weeks ago correctly', () => {
        const now = new Date();
        const weeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(weeksAgo)).toBe('posted 2 weeks ago');
    });

    it('should format months ago correctly', () => {
        const now = new Date();
        const monthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(monthsAgo)).toBe('posted 6 months ago');
    });

    it('should format years ago correctly', () => {
        const now = new Date();
        const yearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
        expect(formatTimeAgo(yearsAgo)).toBe('posted 2 years ago');
    });

    it('should handle singular units correctly', () => {
        const now = new Date();
        const oneSecondAgo = new Date(now.getTime() - 1000);
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        expect(formatTimeAgo(oneSecondAgo)).toBe('posted 1 second ago');
        expect(formatTimeAgo(oneMinuteAgo)).toBe('posted 1 minute ago');
        expect(formatTimeAgo(oneHourAgo)).toBe('posted 1 hour ago');
        expect(formatTimeAgo(oneDayAgo)).toBe('posted 1 day ago');
        expect(formatTimeAgo(oneWeekAgo)).toBe('posted 1 week ago');
        expect(formatTimeAgo(oneMonthAgo)).toBe('posted 1 month ago');
        expect(formatTimeAgo(oneYearAgo)).toBe('posted 1 year ago');
    });

    it('should handle date strings', () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        expect(formatTimeAgo(oneHourAgo.toISOString())).toBe('posted 1 hour ago');
    });
});
