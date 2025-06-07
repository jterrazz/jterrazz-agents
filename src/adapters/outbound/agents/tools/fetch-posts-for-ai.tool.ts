import { DynamicTool } from '@langchain/core/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = [
    // 'GoogleAI',
    // 'nvidia',
    // 'AnthropicAI',
    // 'midjourney',
    // 'sama',
    // 'demishassabis',
    // 'AndrewYNg',
    // 'Ronald_vanLoon',
    // 'alliekmiller',
    // 'DeepLearn007',
    // 'OpenAI',
    'cursor_ai',
];

export function createFetchPostsForAITool(x: XPort) {
    return new DynamicTool({
        description: 'Fetches latest AI-related posts from a predefined list of X users.',
        func: async () => {
            const posts = await Promise.all(
                USERNAMES.map((username) =>
                    x.fetchLatestMessages({
                        timeAgo: { hours: 24 },
                        username,
                    }),
                ),
            );
            return formatXPosts(posts.flat());
        },
        name: 'fetchPostsForAI',
    });
}
