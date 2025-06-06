import { tool } from '@langchain/core/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';

import { createXAdapter } from '../../adapters/outbound/web/x.adapter.js';

export function createFetchDevTweetsTool(apifyToken: string) {
    const devUsernames = ['GithubProjects', 'nodejs', 'colinhacks', 'bunjavascript', 'deno_land'];
    const x = createXAdapter(apifyToken);
    return tool(
        async () => {
            const usernames = devUsernames;
            let allTweets: SocialFeedMessage[] = [];
            for (const username of usernames) {
                const tweets = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get tweets from the last 24 hours
                });
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
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
