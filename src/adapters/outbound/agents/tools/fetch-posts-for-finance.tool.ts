import { type LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../../../../ports/outbound/agents.port.js';
import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { createSafeAgentTool } from '../tool.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['KobeissiLetter'];

export function createFetchPostsForFinanceTool(x: XPort, logger: LoggerPort): AgentToolPort {
    return createSafeAgentTool(
        {
            description: 'Fetches latest Finance-related posts from a predefined list of X users.',
            name: 'fetchPostsForFinance',
        },
        async () => {
            logger.info('Fetching finance posts', { timeframe: '72h', usernames: USERNAMES });

            const posts = await Promise.all(
                USERNAMES.map((username) =>
                    x.fetchLatestMessages({
                        timeAgo: { hours: 72 },
                        username,
                    }),
                ),
            );

            const allPosts = posts.flat();
            logger.info('Retrieved finance posts', {
                totalPosts: allPosts.length,
                userCount: USERNAMES.length,
            });

            return formatXPosts(allPosts);
        },
        logger,
    );
}
