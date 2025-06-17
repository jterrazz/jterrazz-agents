import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

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
