import { type LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../../../../ports/outbound/agents.port.js';
import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

import { createSafeAgentTool } from './tool.js';

const USERNAMES = [
    'GithubProjects',
    'nodejs',
    'colinhacks',
    'bunjavascript',
    'deno_land',
    'rauchg',
];

export function createFetchPostsForDevelopmentTool(x: XPort, logger: LoggerPort): AgentToolPort {
    return createSafeAgentTool(
        {
            description:
                'Fetches latest Development-related posts from a predefined list of X users. No input required.',
            name: 'fetchPostsForDevelopment',
        },
        async () => {
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
        logger,
    );
}
