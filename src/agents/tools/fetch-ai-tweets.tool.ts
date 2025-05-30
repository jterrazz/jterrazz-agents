import { tool } from '@langchain/core/tools';

import { type SocialFeedMessage } from '../../ports/outbound/social-feed.port.js';

import { createNitterAdapter } from '../../adapters/outbound/web-scraper/nitter.adapter.js';

export function createFetchAITweetsTool() {
    const nitter = createNitterAdapter();
    const aiUsernames = [
        'GoogleAI',
        'nvidia',
        'AnthropicAI',
        'metaai',
        'midjourney',
        'sama',
        'demishassabis',
        'AndrewYNg',
        'Ronald_vanLoon',
        'alliekmiller',
        'DeepLearn007',
        'cursor_ai',
    ];
    return tool(
        async (input: string) => {
            let usernames = aiUsernames;
            let limit = 5;
            try {
                if (input) {
                    const parsed = JSON.parse(input);
                    if (parsed.username) usernames = [parsed.username];
                    if (parsed.usernames && Array.isArray(parsed.usernames))
                        usernames = parsed.usernames;
                    if (parsed.limit) limit = parsed.limit;
                }
            } catch {
                /* ignore JSON parse errors, use defaults */
            }
            let allTweets: SocialFeedMessage[] = [];
            for (const username of usernames) {
                const tweets = await nitter.fetchLatestMessages(username, limit);
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
            }
            return JSON.stringify(allTweets);
        },
        {
            description:
                'Fetches latest AI-related tweets from a list of Twitter users. Input: { usernames?: string[], limit?: number }',
            name: 'fetchAITweets',
        },
    );
}
