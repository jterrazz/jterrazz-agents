import puppeteer from 'puppeteer';

import {
    type SocialFeedMessage,
    type SocialFeedPort,
} from '../../../ports/outbound/social-feed.port.js';

export function createNitterAdapter(): SocialFeedPort {
    return {
        async fetchLatestMessages(username: string, limit = 20): Promise<SocialFeedMessage[]> {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.setUserAgent(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            );
            await page.goto(`https://nitter.net/${username}`, { waitUntil: 'networkidle2' });
            let tweetsFound = false;
            try {
                await page.waitForSelector('.timeline-item', { timeout: 10000 });
                tweetsFound = true;
            } catch (e) {
                // Not found, will log below
            }
            const messagesRaw = await page.evaluate((limit: number | undefined) => {
                let items = Array.from(document.querySelectorAll('.timeline-item')).filter(
                    (item) => !item.querySelector('.pinned'),
                );
                if (typeof limit === 'number' && limit > 0) {
                    items = items.slice(0, limit);
                }
                return items.map((item) => {
                    const link = item.querySelector('a.tweet-link')?.getAttribute('href') || '';
                    const idMatch = link.match(/status\/(\d+)/);
                    const id = idMatch ? idMatch[1] : '';
                    const text = item.querySelector('.tweet-content')?.textContent?.trim() || '';
                    const createdAtText =
                        item.querySelector('.tweet-date > a')?.getAttribute('title') || '';
                    const createdAt = createdAtText ? createdAtText : '';
                    let url = link ? 'https://nitter.net' + link : '';
                    const author =
                        item
                            .querySelector('.tweet-header .username')
                            ?.textContent?.replace('@', '')
                            .trim() || '';
                    // Fallback: if id is present but url is missing, construct it
                    if (!url && id && author) {
                        url = `https://nitter.net/${author}/status/${id}`;
                    }
                    return { author, createdAt, id, text, url };
                });
            }, limit);
            await browser.close();
            // Convert createdAt to Date object using robust parsing
            const messages: SocialFeedMessage[] = messagesRaw.map((msg: unknown) => {
                const m = msg as {
                    author: string;
                    createdAt: string;
                    id: string;
                    text: string;
                    url: string;
                };
                const createdAt = m.createdAt ? parseNitterDate(m.createdAt) : new Date();
                return {
                    ...m,
                    createdAt,
                    timeAgo: formatTimeAgo(createdAt),
                };
            });
            return messages;
        },
    };
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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

function parseNitterDate(dateStr: string): Date {
    // Example: 'Jan 11, 2025 · 5:00 PM UTC' or 'May 30, 2025 · 12:38 PM UTC'
    // Remove the dot and everything after for basic parsing
    const match = dateStr.match(/([A-Za-z]{3,9} \d{1,2}, \d{4})(?: · (.*))?/);
    if (match) {
        // If time is present, combine and parse
        if (match[2]) {
            // e.g., 'Jan 11, 2025 5:00 PM UTC'
            const combined = `${match[1]} ${match[2]}`;
            const parsed = Date.parse(combined);
            if (!isNaN(parsed)) return new Date(parsed);
        } else {
            // Just the date
            const parsed = Date.parse(match[1]);
            if (!isNaN(parsed)) return new Date(parsed);
        }
    }
    // Fallback
    const fallback = Date.parse(dateStr);
    return !isNaN(fallback) ? new Date(fallback) : new Date();
}
