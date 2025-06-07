import { type LoggerPort } from '@jterrazz/logger';
import { DynamicTool } from 'langchain/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['GithubProjects', 'nodejs', 'colinhacks', 'bunjavascript', 'deno_land'];

export function createFetchPostsForDevelopmentTool(x: XPort, logger: LoggerPort) {
    return new DynamicTool({
        description: 'Fetches latest Development-related posts from a predefined list of X users.',
        func: async () => {
            logger.info('Fetching development posts', { timeframe: '72h', usernames: USERNAMES });

            const posts = await Promise.all(
                USERNAMES.map((username) =>
                    x.fetchLatestMessages({
                        timeAgo: { hours: 72 },
                        username,
                    }),
                ),
            );

            const allPosts = posts.flat();
            logger.info('Retrieved development posts', {
                totalPosts: allPosts.length,
                userCount: USERNAMES.length,
            });

            return formatXPosts(allPosts);
        },
        name: 'fetchPostsForDevelopment',
    });
}
