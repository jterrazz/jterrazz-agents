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
            for (const username of usernames) {
                const tweets = await nitter.fetchLatestMessages(username);
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

export function useFetchDevTweetsTool() {
    return 'Use the fetchDevTweets tool to get information on what to post about.';
}
