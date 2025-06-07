import { type LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../../../../ports/outbound/agents.port.js';
import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { createSafeAgentTool } from '../tool.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];

export function createFetchPostsForCryptoTool(x: XPort, logger: LoggerPort): AgentToolPort {
    return createSafeAgentTool(
        {
            description:
                'Fetches latest Crypto-related posts from a predefined list of X users. No input required.',
            name: 'fetchPostsForCrypto',
        },
        async () => {
            logger.info('Fetching crypto posts', { timeframe: '72h', usernames: USERNAMES });

            const posts = await Promise.all(
                USERNAMES.map((username) =>
                    x.fetchLatestMessages({
                        timeAgo: { hours: 72 },
                        username,
                    }),
                ),
            );

            const allPosts = posts.flat();
            logger.info('Retrieved crypto posts', {
                totalPosts: allPosts.length,
                userCount: USERNAMES.length,
            });

            return formatXPosts(allPosts);
        },
        logger,
    );
}
