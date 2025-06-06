import { DynamicTool } from '@langchain/core/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';

import { createXAdapter } from '../../adapters/outbound/web/x.adapter.js';

interface TweetWithUsername extends SocialFeedMessage {
    username: string;
}

export function createFetchAITweetsTool(apifyToken: string) {
    const aiUsernames = [
        'GoogleAI',
        'nvidia',
        'AnthropicAI',
        'midjourney',
        'sama',
        'demishassabis',
        'AndrewYNg',
        'Ronald_vanLoon',
        'alliekmiller',
        'DeepLearn007',
        'OpenAI',
        'cursor_ai',
    ];
    const x = createXAdapter(apifyToken);
    return new DynamicTool({
        description: 'Fetches latest AI-related tweets from a predefined list of Twitter users.',
        func: async () => {
            const usernames = aiUsernames;
            let allTweets: TweetWithUsername[] = [];
            for (const username of usernames) {
                const tweets = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get tweets from the last 24 hours
                });
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
            }
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
        },
        name: 'fetchAITweets',
    });
}

export function withFetchAITweetsTool() {
    return 'Use the fetchAITweets tool to get latest information about AI.';
}
