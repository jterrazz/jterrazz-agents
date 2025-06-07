import { DynamicTool } from 'langchain/tools';

import { type XPort, type XPostPort } from '../../ports/outbound/x.port.js';

export const createFetchDevelopmentTweetsTool = (x: XPort) =>
    new DynamicTool({
        description: 'Get recent development-related tweets.',
        func: async () => {
            const devUsernames = [
                'GithubProjects',
                'nodejs',
                'colinhacks',
                'bunjavascript',
                'deno_land',
            ];
            let allTweets: XPostPort[] = [];
            for (const username of devUsernames) {
                const tweets = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get tweets from the last 24 hours
                });
                allTweets = allTweets.concat(tweets);
            }
            return JSON.stringify(allTweets);
        },
        name: 'fetchDevelopmentTweets',
    });

export function withFetchDevTweetsTool() {
    return 'Use the fetchDevTweets tool to get latest information about software development.';
}
