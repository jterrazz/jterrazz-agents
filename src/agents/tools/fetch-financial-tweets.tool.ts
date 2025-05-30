import { tool } from '@langchain/core/tools';

import { createNitterAdapter } from '../../adapters/outbound/web-scraper/nitter.adapter.js';

export function createFetchFinancialTweetsTool() {
    const nitter = createNitterAdapter();
    return tool(
        async (input: string) => {
            let username = 'KobeissiLetter';
            let limit = 5;
            try {
                if (input) {
                    const parsed = JSON.parse(input);
                    if (parsed.username) username = parsed.username;
                    if (parsed.limit) limit = parsed.limit;
                }
            } catch {
                /* ignore JSON parse errors, use defaults */
            }
            const tweets = await nitter.fetchLatestMessages(username, limit);
            return JSON.stringify(tweets);
        },
        {
            description:
                'Fetches latest financial tweets from a Twitter user. Input: { username: string, limit?: number }',
            name: 'fetchFinancialTweets',
        },
    );
}
