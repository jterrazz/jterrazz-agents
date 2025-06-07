import { type LoggerPort } from '@jterrazz/logger';
import { DynamicTool } from 'langchain/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];

export function createFetchPostsForCryptoTool(x: XPort, logger: LoggerPort) {
    return new DynamicTool({
        description: 'Fetches latest Crypto-related posts from a predefined list of X users.',
        func: async () => {
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
        name: 'fetchPostsForCrypto',
    });
}
