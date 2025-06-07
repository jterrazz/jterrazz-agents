export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
        day: 'numeric',
        hour: 'numeric',
        hour12: true,
        minute: 'numeric',
        month: 'long',
        timeZone: 'UTC',
        year: 'numeric',
    });
}
