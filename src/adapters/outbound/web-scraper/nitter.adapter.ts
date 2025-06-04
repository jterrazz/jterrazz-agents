import { PuppeteerCrawler } from 'crawlee';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import {
    type SocialFeedMessage,
    type SocialFeedPort,
} from '../../../ports/outbound/social-feed.port.js';

puppeteer.use(StealthPlugin());

const CHROME_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export function createNitterAdapter(concurrency: number = 1): SocialFeedPort {
    return {
        async fetchLatestMessages(username: string, limit = 20): Promise<SocialFeedMessage[]> {
            const results: SocialFeedMessage[] = [];
            const NITTER_BASE_URL = 'https://nitter.net';
            const url = `${NITTER_BASE_URL}/${username}`;
            console.log(`[NitterAdapter] Fetching URL: ${url} (concurrency: ${concurrency})`);

            const crawler = new PuppeteerCrawler({
                launchContext: {
                    launcher: puppeteer,
                    launchOptions: {
                        args: ['--no-sandbox', '--disable-setuid-sandbox'],
                        headless: true,
                    },
                },
                maxRequestsPerCrawl: concurrency * 3,
                async requestHandler({ page }) {
                    const maxRetries = 3;
                    let attempt = 0;

                    while (attempt < maxRetries) {
                        await page.setUserAgent(CHROME_USER_AGENT);
                        await page.setViewport({ height: 800, width: 1280 });
                        await page.setExtraHTTPHeaders({
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Accept-Language': 'en-US,en;q=0.9',
                            DNT: '1',
                            'Upgrade-Insecure-Requests': '1',
                        });

                        try {
                            await page.goto(url, { waitUntil: 'networkidle2' });
                            await new Promise((res) => setTimeout(res, 2000));

                            try {
                                // Wait for tweet content with a shorter timeout
                                await page.waitForSelector('.timeline-item', { timeout: 5000 });
                                console.log('Found .timeline-item');
                            } catch (e) {
                                console.log(
                                    `[NitterAdapter] Failed to find tweet content on attempt ${attempt + 1}, will retry after 15s.`,
                                );
                                attempt++;
                                if (attempt < maxRetries) {
                                    await new Promise((res) => setTimeout(res, 15000));
                                    continue;
                                }
                                throw new Error(
                                    'Max retries exceeded - could not find tweet content',
                                );
                            }

                            const tweetElements = await page.$$('.timeline-item');
                            console.log('Number of .timeline-item elements:', tweetElements.length);

                            if (tweetElements.length === 0) {
                                console.log(
                                    `[NitterAdapter] No tweets found on attempt ${attempt + 1}, will retry after 15s.`,
                                );
                                attempt++;
                                if (attempt < maxRetries) {
                                    await new Promise((res) => setTimeout(res, 15000));
                                    continue;
                                }
                                throw new Error('Max retries exceeded - no tweets found');
                            }

                            for (let i = 0; i < tweetElements.length; i++) {
                                const el = tweetElements[i];
                                const outerHTML = await el.evaluate((node) => node.outerHTML);
                                console.log(`timeline-item[${i}] outerHTML:`, outerHTML);

                                const isPinned = await el.$('.pinned');
                                if (isPinned) {
                                    console.log(`timeline-item[${i}] is pinned, skipping.`);
                                    continue;
                                }

                                const linkHandle = await el.$('a.tweet-link');
                                const link = linkHandle
                                    ? await linkHandle.evaluate((a) => a.getAttribute('href'))
                                    : '';
                                if (!link)
                                    console.log(`timeline-item[${i}] missing tweet-link href`);
                                const idMatch = link ? link.match(/status\/(\d+)/) : null;
                                const id = idMatch ? idMatch[1] : '';
                                if (!id) console.log(`timeline-item[${i}] missing id`);

                                const textHandle = await el.$('.tweet-content');
                                const text = textHandle
                                    ? await textHandle.evaluate(
                                          (node) => node.textContent?.trim() || '',
                                      )
                                    : '';
                                if (!text) console.log(`timeline-item[${i}] missing tweet-content`);

                                const dateHandle = await el.$('.tweet-date > a');
                                const createdAtText = dateHandle
                                    ? await dateHandle.evaluate((a) => a.getAttribute('title'))
                                    : '';
                                if (!createdAtText)
                                    console.log(`timeline-item[${i}] missing tweet-date`);
                                const createdAt = createdAtText ? createdAtText : '';

                                let tweetUrl = link ? NITTER_BASE_URL + link : '';

                                const authorHandle = await el.$('.tweet-header .username');
                                const author = authorHandle
                                    ? await authorHandle.evaluate(
                                          (node) => node.textContent?.replace('@', '').trim() || '',
                                      )
                                    : '';
                                if (!author) console.log(`timeline-item[${i}] missing author`);

                                if (!tweetUrl && id && author) {
                                    tweetUrl = `${NITTER_BASE_URL}/${author}/status/${id}`;
                                }

                                console.log({ author, createdAt, i, id, text, tweetUrl });

                                const parsedCreatedAt = createdAt
                                    ? parseNitterDate(createdAt)
                                    : new Date();
                                results.push({
                                    author,
                                    createdAt: parsedCreatedAt,
                                    id,
                                    text,
                                    timeAgo: formatTimeAgo(parsedCreatedAt),
                                    url: tweetUrl,
                                });
                            }
                            break; // Success, exit retry loop
                        } catch (error) {
                            console.error(`Error on attempt ${attempt + 1}:`, error);
                            attempt++;
                            if (attempt < maxRetries) {
                                await new Promise((res) => setTimeout(res, 15000));
                            } else {
                                throw error;
                            }
                        }
                    }
                },
            });

            await crawler.run([url]);
            console.log('Results:', JSON.stringify(results, null, 2));
            return results;
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
