import { ApifyClient } from 'apify-client';
import { z } from 'zod';

import { type XPort, type XPostPort } from '../../../ports/outbound/web/x.port.js';

const authorSchema = z.object({
    name: z.string().nullable(),
    screen_name: z.string().nullable(),
});

const postSchema = z.object({
    author: authorSchema,
    created_at: z.string().nullable(),
    text: z.string().nullable(),
    tweet_id: z.string().nullable(),
});

export interface FetchLatestPostsParams {
    limit?: number;
    timeAgo?: { hours: number };
    username: string;
}

export const createXAdapter = (apiToken: string): XPort => {
    const client = new ApifyClient({
        token: apiToken,
    });

    return {
        async fetchLatestMessages(params: FetchLatestPostsParams): Promise<XPostPort[]> {
            const { limit, timeAgo, username } = params;

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
            const posts = z.array(postSchema).parse(items);

            // Filter out posts with null essential fields
            const validPosts = posts.filter(
                (post) =>
                    post.author.name !== null &&
                    post.author.screen_name !== null &&
                    post.created_at !== null &&
                    post.text !== null &&
                    post.tweet_id !== null,
            );

            // Filter posts based on timeAgo if provided
            const now = new Date();
            const filteredPosts = timeAgo
                ? validPosts.filter((post) => {
                      const postDate = new Date(post.created_at!);
                      const hoursAgo = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
                      return hoursAgo <= timeAgo.hours;
                  })
                : validPosts;

            // Apply limit after filtering
            const limitedPosts = limit ? filteredPosts.slice(0, limit) : filteredPosts;

            // Transform to SocialFeedMessage format
            return limitedPosts.map((post) => ({
                author: post.author.name!,
                createdAt: new Date(post.created_at!),
                id: post.tweet_id!,
                text: post.text!,
                url: `https://x.com/${post.author.screen_name}/status/${post.tweet_id}`,
                username,
            }));
        },
    };
};
