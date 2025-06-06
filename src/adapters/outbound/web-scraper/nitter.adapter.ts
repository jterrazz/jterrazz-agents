import { PuppeteerCrawler } from 'crawlee';
import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import {
    type SocialFeedMessage,
    type SocialFeedPort,
} from '../../../ports/outbound/social-feed.port.js';

// Add stealth plugin
puppeteer.use(StealthPlugin());

const CHROME_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export function createXAdapter(concurrency: number = 1): SocialFeedPort {
    return {
        async fetchLatestMessages(username: string, limit = 20): Promise<SocialFeedMessage[]> {
            const results: SocialFeedMessage[] = [];
            const X_BASE_URL = 'https://x.com';
            const url = `${X_BASE_URL}/${username}`;
            console.log(`[XAdapter] Fetching URL: ${url}`);

            const crawler = new PuppeteerCrawler({
                headless: true,
                launchContext: {
                    launchOptions: {
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-accelerated-2d-canvas',
                            '--disable-gpu',
                            '--disable-web-security',
                            '--disable-features=VizDisplayCompositor',
                            '--window-size=1920,1080',
                            '--start-maximized',
                        ],
                    },
                },
                maxRequestsPerCrawl: concurrency * 3,
                async requestHandler({ page, request }) {
                    try {
                        // Set viewport
                        await page.setViewport({ height: 1080, width: 1920 });

                        // Set user agent
                        await page.setUserAgent(CHROME_USER_AGENT);

                        // Set extra headers to mimic real browser
                        await page.setExtraHTTPHeaders({
                            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Accept-Language': 'en-US,en;q=0.5',
                            Connection: 'keep-alive',
                            DNT: '1',
                            'Sec-Fetch-Dest': 'document',
                            'Sec-Fetch-Mode': 'navigate',
                            'Sec-Fetch-Site': 'none',
                            'Sec-Fetch-User': '?1',
                            'Upgrade-Insecure-Requests': '1',
                        });

                        // Navigate to the profile
                        console.log(`[XAdapter] Navigating to ${request.url}`);
                        await page.goto(request.url, {
                            timeout: 30000,
                            waitUntil: 'domcontentloaded',
                        });

                        // Wait a bit for initial page load
                        await new Promise((resolve) => setTimeout(resolve, 2000));

                        // Handle potential login modal or cookie banner
                        try {
                            // Close any modal that might appear
                            const modalClose = await page.$('[data-testid="app-bar-close"]');
                            if (modalClose) {
                                await modalClose.click();
                                await new Promise((resolve) => setTimeout(resolve, 1000));
                            }
                        } catch (e) {
                            console.log('[XAdapter] No modal to close');
                        }

                        // Wait for tweets to start loading
                        console.log('[XAdapter] Waiting for tweets to load...');
                        await page.waitForSelector('article[data-testid="tweet"]', {
                            timeout: 15000,
                            visible: true,
                        });

                        // Additional wait for content to stabilize
                        await new Promise((resolve) => setTimeout(resolve, 3000));

                        // Scroll to load more tweets if needed
                        if (limit > 3) {
                            await autoScroll(page, limit);
                        }

                        // Get all tweets
                        const tweets = await page.$$('article[data-testid="tweet"]');
                        console.log(`[XAdapter] Found ${tweets.length} tweets`);

                        let tweetCount = 0;
                        for (const tweet of tweets) {
                            if (tweetCount >= limit) break;

                            try {
                                // Check if this is a pinned tweet and skip it
                                const isPinned = await tweet
                                    .$('[data-testid="socialContext"]')
                                    .then((el) =>
                                        el
                                            ? el.evaluate(
                                                  (node) =>
                                                      node.textContent?.includes('Pinned') || false,
                                              )
                                            : false,
                                    )
                                    .catch(() => false);

                                if (isPinned) {
                                    console.log('[XAdapter] Skipping pinned tweet');
                                    continue;
                                }

                                // Extract tweet text
                                const tweetText = await tweet
                                    .$eval(
                                        '[data-testid="tweetText"]',
                                        (el) => el.textContent?.trim() || '',
                                    )
                                    .catch(() => '');

                                if (!tweetText) {
                                    console.log('[XAdapter] No tweet text found, skipping');
                                    continue;
                                }

                                // Extract tweet link and ID
                                const tweetLink = await tweet
                                    .$eval(
                                        'a[href*="/status/"]',
                                        (el: HTMLAnchorElement) => el.href,
                                    )
                                    .catch(() => '');

                                if (!tweetLink) {
                                    console.log('[XAdapter] No tweet link found, skipping');
                                    continue;
                                }

                                const tweetId = tweetLink.split('/status/')[1]?.split('?')[0] || '';

                                // Extract timestamp
                                const timestamp = await tweet
                                    .$eval('time', (el) => el.getAttribute('datetime') || '')
                                    .catch(() => '');

                                const createdAt = timestamp ? new Date(timestamp) : new Date();

                                console.log(`[XAdapter] Extracted tweet: ${tweetId}`);

                                results.push({
                                    author: username,
                                    createdAt,
                                    id: tweetId,
                                    text: tweetText,
                                    timeAgo: formatTimeAgo(createdAt),
                                    url: tweetLink,
                                });

                                tweetCount++;
                            } catch (error) {
                                console.error('[XAdapter] Error parsing tweet:', error);
                                continue;
                            }
                        }
                    } catch (error) {
                        console.error('[XAdapter] Error during scraping:', error);
                        throw error;
                    }
                },
            });

            await crawler.run([{ url }]);
            console.log(`[XAdapter] Results: ${results.length} tweets extracted`);
            console.log('Results:', JSON.stringify(results, null, 2));
            return results;
        },
    };
}

async function autoScroll(page: Page, targetCount: number) {
    console.log(`[XAdapter] Auto-scrolling to load more tweets (target: ${targetCount})`);

    let previousTweetCount = 0;
    let currentTweetCount = 0;
    const maxScrolls = 5; // Limit scrolling
    let scrollCount = 0;
    let stableCount = 0; // Count of consecutive stable results

    while (scrollCount < maxScrolls && stableCount < 3) {
        // Count current tweets
        const tweets = await page.$$('article[data-testid="tweet"]');
        currentTweetCount = tweets.length;
        console.log(`[XAdapter] Current tweet count: ${currentTweetCount}`);

        if (currentTweetCount >= targetCount) {
            console.log(`[XAdapter] Target tweet count reached: ${currentTweetCount}`);
            break;
        }

        // Scroll down
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Wait for content to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check if we got new content
        if (currentTweetCount === previousTweetCount) {
            stableCount++;
            console.log(`[XAdapter] No new tweets loaded (stable count: ${stableCount})`);
        } else {
            stableCount = 0;
        }

        previousTweetCount = currentTweetCount;
        scrollCount++;
    }

    console.log(`[XAdapter] Scrolling completed. Final tweet count: ${currentTweetCount}`);
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
