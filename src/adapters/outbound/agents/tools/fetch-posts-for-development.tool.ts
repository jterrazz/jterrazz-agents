import { DynamicTool } from 'langchain/tools';

import { type XPort } from '../../../../ports/outbound/web/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const USERNAMES = ['GithubProjects', 'nodejs', 'colinhacks', 'bunjavascript', 'deno_land'];

export const createFetchPostsForDevelopmentTool = (x: XPort) =>
    new DynamicTool({
        description: 'Fetches latest Development-related posts from a predefined list of X users.',
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
        name: 'fetchPostsForDevelopment',
    });

export function withFetchPostsForDevelopmentTool() {
    return 'Use the fetchPostsForDevelopment tool to get latest information about software development.';
}
