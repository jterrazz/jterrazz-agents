import { tool } from '@langchain/core/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';

import { createNitterAdapter } from '../../adapters/outbound/web-scraper/nitter.adapter.js';

export function createFetchCryptoTweetsTool() {
    const nitter = createNitterAdapter();
    const cryptoUsernames = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];
    return tool(
        async () => {
            const usernames = cryptoUsernames;
            let allTweets: SocialFeedMessage[] = [];
            for (const username of usernames) {
                const tweets = await nitter.fetchLatestMessages(username);
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
            }
            return JSON.stringify(allTweets);
        },
        {
            description: 'Fetches latest crypto tweets from a predefined list of Twitter users.',
            name: 'fetchCryptoTweets',
        },
    );
}

export function withFetchCryptoTweetsTool() {
    return 'Use the fetchCryptoTweets tool to get latest information about crypto.';
}
