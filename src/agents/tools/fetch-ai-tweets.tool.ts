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
        async () => {
            const usernames = aiUsernames;
            let allTweets: SocialFeedMessage[] = [];
            for (const username of usernames) {
                const tweets = await nitter.fetchLatestMessages(username);
                allTweets = allTweets.concat(tweets.map((t) => ({ ...t, username })));
            }
            return JSON.stringify(allTweets);
        },
        {
            description:
                'Fetches latest AI-related tweets from a predefined list of Twitter users.',
            name: 'fetchAITweets',
        },
    );
}
