import { type LoggerPort } from '@jterrazz/logger';
import { DynamicTool } from 'langchain/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['KobeissiLetter'];

export function createFetchPostsForFinanceTool(x: XPort, logger: LoggerPort) {
    return new DynamicTool({
        description: 'Fetches latest Finance-related posts from a predefined list of X users.',
        func: async () => {
            logger.info('Fetching finance posts', { timeframe: '24h', usernames: USERNAMES });
            
            const posts = await Promise.all(
                USERNAMES.map((username) =>
                    x.fetchLatestMessages({
                        timeAgo: { hours: 24 },
                        username,
                    }),
                ),
            );
            
            const allPosts = posts.flat();
            logger.info('Retrieved finance posts', { 
                totalPosts: allPosts.length,
                userCount: USERNAMES.length 
            });
            
            return formatXPosts(allPosts);
        },
        name: 'fetchPostsForFinance',
    });
}
