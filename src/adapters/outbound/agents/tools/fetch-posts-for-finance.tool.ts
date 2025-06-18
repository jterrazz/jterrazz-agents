import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type XPort } from '../../../../ports/outbound/providers/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const TOOL_NAME = 'fetchPostsForFinance';

const TOOL_DESCRIPTION = `
Fetches latest finance-related posts from a predefined list of X users. No input required.
`.trim();

const USERNAMES = ['RayDalio', 'WarrenBuffett', 'elonmusk', 'chamath', 'naval', 'profgalloway'];

export function createFetchPostsForFinanceTool(x: XPort, logger: LoggerPort): ToolPort {
    async function fetchPostsForFinance(): Promise<string> {
        logger.info('Executing fetchPostsForFinance tool...');

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
            logger.info('No finance posts found in the last 72 hours.');
        } else {
            logger.info(`Found ${allPosts.length} finance posts.`, { count: allPosts.length });
        }

        return formatXPosts(allPosts);
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchPostsForFinance,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
