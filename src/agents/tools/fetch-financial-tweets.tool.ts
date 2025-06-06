import { tool } from '@langchain/core/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';

import { createXAdapter } from '../../adapters/outbound/web/x.adapter.js';

interface TweetWithUsername extends SocialFeedMessage {
    username: string;
}

export function createFetchFinancialTweetsTool(apifyToken: string) {
    const financialUsernames = ['KobeissiLetter'];
    const x = createXAdapter(apifyToken);
    return tool(
        async () => {
            try {
                const usernames = financialUsernames;
                let allTweets: TweetWithUsername[] = [];
                for (const username of usernames) {
                    const tweets = await x.fetchLatestMessages({
                        timeAgo: { hours: 24 },
                        username, // Get tweets from the last 24 hours
                    });
                    allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
                }

                console.log('allTweets', JSON.stringify(allTweets, null, 2));
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
            } catch (error) {
                console.error('Error in fetchFinancialTweetsTool:', error);
                throw error; // Re-throw to let the agent handle it
            }
        },
        {
            description: 'Fetches latest financial tweets from a predefined list of Twitter users.',
            name: 'fetchFinancialTweets',
        },
    );
}

export function withFetchFinancialTweetsTool() {
    return 'Use the fetchFinancialTweets tool to get latest information about financial news.';
}
