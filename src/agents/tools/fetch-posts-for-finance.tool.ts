import { DynamicTool } from 'langchain/tools';

import { type XPort, type XPostPort } from '../../ports/outbound/x.port.js';

export function createFetchPostsForFinanceTool(x: XPort) {
    const financialUsernames = ['KobeissiLetter'];
    return new DynamicTool({
        description: 'Fetches latest financial posts from a predefined list of X users.',
        func: async () => {
            try {
                const usernames = financialUsernames;
                let allPosts: XPostPort[] = [];
                for (const username of usernames) {
                    const posts = await x.fetchLatestMessages({
                        timeAgo: { hours: 24 },
                        username, // Get posts from the last 24 hours
                    });
                    allPosts = allPosts.concat(posts);
                }

                console.log('allPosts', JSON.stringify(allPosts, null, 2));
                // Format posts with newlines and clear structure
                return allPosts
                    .map(
                        (post) =>
                            `Author: ${post.author} (@${post.username})\n` +
                            `Time: ${post.timeAgo}\n` +
                            `Content: ${post.text}\n` +
                            `URL: ${post.url}\n`,
                    )
                    .join('\n');
            } catch (error) {
                console.error('Error in fetchPostsForFinanceTool:', error);
                throw error; // Re-throw to let the agent handle it
            }
        },
        name: 'fetchPostsForFinance',
    });
}

export function withFetchPostsForFinanceTool() {
    return 'Use the fetchPostsForFinance tool to get latest information about financial news.';
} 