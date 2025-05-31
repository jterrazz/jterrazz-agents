import { tool } from '@langchain/core/tools';

import { createNitterAdapter } from '../../adapters/outbound/web-scraper/nitter.adapter.js';

export function createFetchFinancialTweetsTool() {
    const nitter = createNitterAdapter();
    return tool(
        async () => {
            const username = 'KobeissiLetter';
            const tweets = await nitter.fetchLatestMessages(username);
            return JSON.stringify(tweets);
        },
        {
            description:
                'Fetches latest financial tweets from a predefined Twitter user.',
            name: 'fetchFinancialTweets',
        },
    );
}

export function useFetchFinancialTweetsTool() {
    return 'Use the fetchFinancialTweets tool to get information on what to post about.';
}
