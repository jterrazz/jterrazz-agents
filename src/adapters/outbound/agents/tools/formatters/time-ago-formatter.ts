export function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `posted ${diffSec} second${diffSec === 1 ? '' : 's'} ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `posted ${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `posted ${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;

    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `posted ${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

    const diffWk = Math.floor(diffDay / 7);
    if (diffWk < 4) return `posted ${diffWk} week${diffWk === 1 ? '' : 's'} ago`;

    const diffMo = Math.floor(diffDay / 30);
    if (diffMo < 12) return `posted ${diffMo} month${diffMo === 1 ? '' : 's'} ago`;

    const diffYr = Math.floor(diffDay / 365);
    return `posted ${diffYr} year${diffYr === 1 ? '' : 's'} ago`;
}
