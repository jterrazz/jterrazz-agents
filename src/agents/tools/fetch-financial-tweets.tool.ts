import { tool } from '@langchain/core/tools';

import { createXAdapter } from '../../adapters/outbound/web-scraper/nitter.adapter.js';

export function createFetchFinancialTweetsTool() {
    const nitter = createXAdapter(1);
    return tool(
        async () => {
            const username = 'KobeissiLetter';
            const today = new Date();
            const todayUTC = new Date(
                Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
            );
            const tweets = await nitter.fetchLatestMessages(username);
            const todaysTweets = tweets.filter((t) => {
                const tweetDate = new Date(t.createdAt);
                return (
                    tweetDate.getUTCFullYear() === todayUTC.getUTCFullYear() &&
                    tweetDate.getUTCMonth() === todayUTC.getUTCMonth() &&
                    tweetDate.getUTCDate() === todayUTC.getUTCDate()
                );
            });
            return JSON.stringify(todaysTweets);
        },
        {
            description: 'Fetches latest financial tweets from a predefined Twitter user.',
            name: 'fetchFinancialTweets',
        },
    );
}

export function withFetchFinancialTweetsTool() {
    return 'Use the fetchFinancialTweets tool to get latest information about finance.';
}
