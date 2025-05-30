import fs from 'fs';
import puppeteer from 'puppeteer';

import {
    type SocialFeedMessage,
    type SocialFeedPort,
} from '../../../ports/outbound/twitter-feed.port.js';

export function createNitterTwitterAdapter(): SocialFeedPort {
    return {
        async fetchLatestMessages(username: string, limit = 10): Promise<SocialFeedMessage[]> {
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
                let items = Array.from(document.querySelectorAll('.timeline-item'))
                    .filter(item => !item.querySelector('.pinned'));
                if (typeof limit === 'number' && limit > 0) {
                    items = items.slice(0, limit);
                }
                return items.map((item) => {
                    const link = item.querySelector('a.tweet-link')?.getAttribute('href') || '';
                    const idMatch = link.match(/status\/(\d+)/);
                    const id = idMatch ? idMatch[1] : '';
                    const text = item.querySelector('.tweet-content')?.textContent?.trim() || '';
                    const createdAtText = item.querySelector('.tweet-date > a')?.getAttribute('title') || '';
                    const createdAt = createdAtText ? createdAtText : '';
                    const url = link ? 'https://nitter.net' + link : '';
                    const author = item.querySelector('.tweet-header .username')?.textContent?.replace('@', '').trim() || '';
                    return { author, createdAt, id, text, url };
                });
            }, limit);
            if (!tweetsFound || messagesRaw.length === 0) {
                const html = await page.content();
                fs.writeFileSync('nitter-debug.html', html, 'utf-8');
                 
                console.error('No tweets found. Page HTML saved to nitter-debug.html');
            }
            await browser.close();
            // Convert createdAt to Date object using robust parsing
            const messages: SocialFeedMessage[] = messagesRaw.map((msg: any) => ({
                ...msg,
                createdAt: msg.createdAt ? parseNitterDate(msg.createdAt) : new Date(),
            }));
            return messages;
        },
    };
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
