import { tool } from '@langchain/core/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';

import { createNitterAdapter } from '../../adapters/outbound/web-scraper/nitter.adapter.js';

export function createFetchDevTweetsTool() {
    const nitter = createNitterAdapter();
    const devUsernames = ['GithubProjects', 'nodejs', 'colinhacks', 'bunjavascript', 'deno_land'];
    return tool(
        async () => {
            const usernames = devUsernames;
            let allTweets: SocialFeedMessage[] = [];
            const today = new Date();
            const todayUTC = new Date(
                Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
            );
            for (const username of usernames) {
                const tweets = await nitter.fetchLatestMessages(username);
                const todaysTweets = tweets.filter((t) => {
                    const tweetDate = new Date(t.createdAt);
                    return (
                        tweetDate.getUTCFullYear() === todayUTC.getUTCFullYear() &&
                        tweetDate.getUTCMonth() === todayUTC.getUTCMonth() &&
                        tweetDate.getUTCDate() === todayUTC.getUTCDate()
                    );
                });
                allTweets = allTweets.concat(todaysTweets.map((t) => ({ ...t, username })));
            }
            return JSON.stringify(allTweets);
        },
        {
            description:
                'Fetches latest dev-related tweets from a predefined list of Twitter users.',
            name: 'fetchDevTweets',
        },
    );
}

export function withFetchDevTweetsTool() {
    return 'Use the fetchDevTweets tool to get latest information about software development.';
}
