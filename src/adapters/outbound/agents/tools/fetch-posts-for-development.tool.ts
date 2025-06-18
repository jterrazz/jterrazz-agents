import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type XPort } from '../../../../ports/outbound/providers/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const TOOL_NAME = 'fetchPostsForDevelopment';

const TOOL_DESCRIPTION = `
Fetches latest development-related posts from a predefined list of X users. No input required.
`.trim();

const USERNAMES = [
    'dan_abramov',
    'ryanflorence',
    'kentcdodds',
    'bradleyboy',
    'wesbos',
    'addyosmani',
    'swyx',
    'vercel',
    'github',
    'nodejs',
    'reactjs',
    'vuejs',
    'angular',
];

export function createFetchPostsForDevelopmentTool(x: XPort, logger: LoggerPort): ToolPort {
    async function fetchPostsForDevelopment(): Promise<string> {
        logger.debug('Fetching development posts', { timeframe: '72h', usernames: USERNAMES });

        const posts = await Promise.all(
            USERNAMES.map((username) =>
                x.fetchLatestMessages({
                    timeAgo: { hours: 72 },
                    username,
                }),
            ),
        );

        const allPosts = posts.flat();

        if (allPosts.length === 0) {
            logger.info('No development posts found in the last 72 hours.');
        } else {
            logger.info(`Found ${allPosts.length} development posts.`, {
                count: allPosts.length,
            });
        }

        return formatXPosts(allPosts);
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchPostsForDevelopment,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
