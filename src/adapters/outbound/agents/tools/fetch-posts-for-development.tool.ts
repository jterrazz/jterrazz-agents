import { DynamicTool } from 'langchain/tools';

import { type XPort, type XPostPort } from '../../../../ports/outbound/web/x.port.js';

export const createFetchPostsForDevelopmentTool = (x: XPort) =>
    new DynamicTool({
        description: 'Get recent development-related posts.',
        func: async () => {
            const devUsernames = [
                'GithubProjects',
                'nodejs',
                'colinhacks',
                'bunjavascript',
                'deno_land',
            ];
            let allPosts: XPostPort[] = [];
            for (const username of devUsernames) {
                const posts = await x.fetchLatestMessages({
                    timeAgo: { hours: 24 },
                    username, // Get posts from the last 24 hours
                });
                allPosts = allPosts.concat(posts);
            }
            return JSON.stringify(allPosts);
        },
        name: 'fetchPostsForDevelopment',
    });

export function withFetchPostsForDevelopmentTool() {
    return 'Use the fetchPostsForDevelopment tool to get latest information about software development.';
}
