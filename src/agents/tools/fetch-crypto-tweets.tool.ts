import { DynamicTool } from 'langchain/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';
import { type XPort } from '../../ports/outbound/x.port.js';

interface TweetWithUsername extends SocialFeedMessage {
    username: string;
}

export function createFetchCryptoTweetsTool(x: XPort) {
    const cryptoUsernames = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];
    return new DynamicTool({
        description: 'Fetches latest crypto tweets from a predefined list of Twitter users.',
        func: async () => {
            const usernames = cryptoUsernames;
            let allTweets: TweetWithUsername[] = [];
            for (const username of usernames) {
                const tweets = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get tweets from the last 24 hours
                });
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
            }
            // Format tweets with newlines and clear structure
            return allTweets
                .map(
                    (tweet) =>
                        `Author: ${tweet.author} (@${tweet.username})\n` +
                        `Time: ${tweet.timeAgo}\n` +
                        `Content: ${tweet.text}\n` +
                        `URL: ${tweet.url}\n`,
                )
                .join('\n');
        },
        name: 'fetchCryptoTweets',
    });
}

export function withFetchCryptoTweetsTool() {
    return 'Use the fetchCryptoTweets tool to get latest information about crypto.';
}
