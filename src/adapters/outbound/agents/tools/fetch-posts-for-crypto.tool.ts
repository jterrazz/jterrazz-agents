import { DynamicTool } from 'langchain/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['pete_rizzo_', 'cz_binance', 'VitalikButerin'];

export function createFetchPostsForCryptoTool(x: XPort) {
    return new DynamicTool({
        description: 'Fetches latest Crypto-related posts from a predefined list of X users.',
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
        name: 'fetchPostsForCrypto',
    });
}
