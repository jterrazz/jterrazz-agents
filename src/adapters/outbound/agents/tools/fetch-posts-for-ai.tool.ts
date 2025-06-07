import { DynamicTool } from '@langchain/core/tools';

import { type XPort, type XPostPort } from '../../../../ports/outbound/web/x.port.js';

export function createFetchPostsForAITool(x: XPort) {
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
    return new DynamicTool({
        description: 'Fetches latest AI-related posts from a predefined list of X users.',
        func: async () => {
            const usernames = aiUsernames;
            let allPosts: XPostPort[] = [];
            for (const username of usernames) {
                const posts = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get posts from the last 24 hours
                });
                allPosts = allPosts.concat(posts.map((p) => ({ ...p, username })));
            }
            // Format posts with newlines and clear structure
            return allPosts
                .map(
                    (post) =>
                        `Author: ${post.author} (@${post.username})\n` +
                        `Time: ${post.timeAgo}\n` +
                        `Content: ${post.text}\n` +
                        `URL: ${post.url}\n`,
                )
                .join('\n');
        },
        name: 'fetchPostsForAI',
    });
}

export function withFetchPostsForAITool() {
    return 'Use the fetchPostsForAI tool to get latest information about AI.';
}
