import { type LoggerPort } from '@jterrazz/logger';
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

export function createFetchPostsForAITool(x: XPort, logger: LoggerPort) {
    return new DynamicTool({
        description: 'Fetches latest AI-related posts from a predefined list of X users.',
        func: async () => {
            logger.info('Fetching AI posts', { timeframe: '72h', usernames: USERNAMES });

            const posts = await Promise.all(
                USERNAMES.map((username) =>
                    x.fetchLatestMessages({
                        timeAgo: { hours: 72 },
                        username,
                    }),
                ),
            );

            const allPosts = posts.flat();
            logger.info('Retrieved AI posts', {
                totalPosts: allPosts.length,
                userCount: USERNAMES.length,
            });

            return formatXPosts(allPosts);
        },
        name: 'fetchPostsForAI',
    });
}
