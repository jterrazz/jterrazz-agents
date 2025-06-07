import { DynamicTool } from 'langchain/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['KobeissiLetter'];

export function createFetchPostsForFinanceTool(x: XPort) {
    return new DynamicTool({
        description: 'Fetches latest Finance-related posts from a predefined list of X users.',
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
        name: 'fetchPostsForFinance',
    });
}

export function withFetchPostsForFinanceTool() {
    return 'Use the fetchPostsForFinance tool to get latest information about financial news.';
}
