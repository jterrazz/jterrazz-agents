import { tool } from '@langchain/core/tools';

import { type TwitterFeedMessage } from '../../ports/outbound/twitter-feed.port.js';

import { createNitterTwitterAdapter } from '../../adapters/outbound/web-scraper/nitter-twitter.adapter.js';

export function createFetchCryptoTweetsTool() {
    const nitter = createNitterTwitterAdapter();
    const cryptoUsernames = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];
    return tool(
        async (input: string) => {
            let usernames = cryptoUsernames;
            let limit = 5;
            try {
                if (input) {
                    const parsed = JSON.parse(input);
                    if (parsed.username) usernames = [parsed.username];
                    if (parsed.usernames && Array.isArray(parsed.usernames)) usernames = parsed.usernames;
                    if (parsed.limit) limit = parsed.limit;
                }
            } catch {
                /* ignore JSON parse errors, use defaults */
            }
            let allTweets: TwitterFeedMessage[] = [];
            for (const username of usernames) {
                const tweets = await nitter.fetchLatestMessages(username, limit);
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
            }
            return JSON.stringify(allTweets);
        },
        {
            description:
                'Fetches latest crypto tweets from a list of Nitter users. Input: { usernames?: string[], limit?: number }',
            name: 'fetchCryptoTweets',
        },
    );
} 