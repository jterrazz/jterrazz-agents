import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const TOOL_NAME = 'fetchPostsForCrypto';

const TOOL_DESCRIPTION = `
Fetches latest cryptocurrency-related posts from a predefined list of X users. No input required.
`.trim();

const USERNAMES = ['VitalikButerin', 'balajis', 'elonmusk', 'garyvee', 'aantonop', 'naval'];

export function createFetchPostsForCryptoTool(x: XPort, logger: LoggerPort): ToolPort {
    async function fetchPostsForCrypto(): Promise<string> {
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
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchPostsForCrypto,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
