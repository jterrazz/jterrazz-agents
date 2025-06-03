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
            try {
                console.log('Fetching AI tweets');
                const usernames = aiUsernames;
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

                console.log(`Found ${allTweets.length} tweets related to AI`);

                return JSON.stringify(allTweets);
            } catch (error) {
                console.error('Error fetching AI tweets', error);
                throw error;
            }
        },
        {
            description:
                'Fetches latest AI-related tweets from a predefined list of Twitter users.',
            name: 'fetchAITweets',
        },
    );
}

export function withFetchAITweetsTool() {
    return 'Use the fetchAITweets tool to get latest information about AI.';
}
