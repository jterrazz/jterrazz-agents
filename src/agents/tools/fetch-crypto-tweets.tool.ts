import { DynamicTool } from 'langchain/tools';

import { type XPort, type XPostPort } from '../../ports/outbound/x.port.js';

export function createFetchCryptoTweetsTool(x: XPort) {
    const cryptoUsernames = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];
    return new DynamicTool({
        description: 'Fetches latest crypto posts from a predefined list of X users.',
        func: async () => {
            const usernames = cryptoUsernames;
            let allPosts: XPostPort[] = [];
            for (const username of usernames) {
                const posts = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get posts from the last 24 hours
                });
                allPosts = allPosts.concat(posts);
            }
            // Format posts with newlines and clear structure
            return allPosts
                .map(
                    (post) =>
                        `Author: ${post.author} (@${post.username})\n` +
                        `Time: ${post.timeAgo}\n` +
                        `Content: ${post.text}\n` +
                        `URL: ${post.url}\n`,
                )
                .join('\n');
        },
        name: 'fetchCryptoTweets',
    });
}

export function withFetchCryptoTweetsTool() {
    return 'Use the fetchCryptoTweets tool to get latest information about crypto.';
}
