import { ApifyClient } from 'apify-client';
import { z } from 'zod';

import {
    type SocialFeedMessage,
    type SocialFeedPort,
} from '../../../ports/outbound/social-feed.port.js';

const authorSchema = z.object({
    avatar: z.string().nullable(),
    blue_verified: z.boolean(),
    name: z.string(),
    rest_id: z.string(),
    screen_name: z.string(),
});

const videoVariantSchema = z.object({
    bitrate: z.number().optional(),
    content_type: z.string(),
    url: z.string(),
});

const videoSchema = z.object({
    aspect_ratio: z.array(z.number()),
    duration: z.number().nullable(),
    id: z.string(),
    media_url_https: z.string(),
    original_info: z.object({
        focus_rects: z.array(z.any()),
        height: z.number(),
        width: z.number(),
    }),
    variants: z.array(videoVariantSchema),
});

const photoSchema = z.object({
    id: z.string(),
    media_url_https: z.string(),
    sizes: z
        .object({
            h: z.number(),
            w: z.number(),
        })
        .optional(),
});

const mediaSchema = z
    .union([
        z.array(z.any()),
        z.object({
            photo: z.array(photoSchema).optional(),
            video: z.array(videoSchema).optional(),
        }),
    ])
    .optional();

const entitiesSchema = z.object({
    hashtags: z.array(z.any()),
    symbols: z.array(z.any()),
    timestamps: z.array(z.any()),
    urls: z.array(z.any()),
    user_mentions: z.array(z.any()),
});

const tweetSchema = z.object({
    author: authorSchema,
    bookmarks: z.number(),
    conversation_id: z.string(),
    created_at: z.string(),
    entities: entitiesSchema,
    favorites: z.number(),
    lang: z.string(),
    media: mediaSchema,
    quoted: z.any().optional(),
    quotes: z.number(),
    replies: z.number(),
    reply_to: z.string().optional(),
    retweets: z.number(),
    source: z.string().optional(),
    text: z.string(),
    tweet_id: z.string(),
    views: z.string(),
});

export interface FetchLatestMessagesParams {
    limit?: number;
    timeAgo?: { hours: number };
    username: string;
}

export const createXAdapter = (apiToken: string): SocialFeedPort => {
    const client = new ApifyClient({
        token: apiToken,
    });

    return {
        async fetchLatestMessages(params: FetchLatestMessagesParams): Promise<SocialFeedMessage[]> {
            const { limit, timeAgo, username } = params;
            console.log('Fetching latest messages for username:', username);
            console.log('With timeAgo filter:', timeAgo);

            // Prepare the actor input
            const input = {
                max_posts: 20,
                // Keep hard limit for Apify call
                search_type: 'Latest',
                username,
            };

            // Call the actor
            const run = await client.actor('danek/twitter-scraper-ppr').call(input);

            // Wait for the actor to finish and get the results
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            // Parse and validate the results
            const tweets = z.array(tweetSchema).parse(items);

            // Filter tweets based on timeAgo if provided
            const now = new Date();
            const filteredTweets = timeAgo
                ? tweets.filter((tweet) => {
                      const tweetDate = new Date(tweet.created_at);
                      const hoursAgo = (now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60);
                      return hoursAgo <= timeAgo.hours;
                  })
                : tweets;

            // Apply limit after filtering
            const limitedTweets = limit ? filteredTweets.slice(0, limit) : filteredTweets;

            // Transform to SocialFeedMessage format
            return limitedTweets.map((tweet) => ({
                author: tweet.author.name,
                createdAt: new Date(tweet.created_at),
                id: tweet.tweet_id,
                text: tweet.text,
                timeAgo: formatTimeAgo(new Date(tweet.created_at)),
                url: `https://twitter.com/${tweet.author.screen_name}/status/${tweet.tweet_id}`,
            }));
        },
    };
};

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `posted ${diffSec} second${diffSec === 1 ? '' : 's'} ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `posted ${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `posted ${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `posted ${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    const diffWk = Math.floor(diffDay / 7);
    if (diffWk < 4) return `posted ${diffWk} week${diffWk === 1 ? '' : 's'} ago`;
    const diffMo = Math.floor(diffDay / 30);
    if (diffMo < 12) return `posted ${diffMo} month${diffMo === 1 ? '' : 's'} ago`;
    const diffYr = Math.floor(diffDay / 365);
    return `posted ${diffYr} year${diffYr === 1 ? '' : 's'} ago`;
}
