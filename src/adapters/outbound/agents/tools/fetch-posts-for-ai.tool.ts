import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type XPort } from '../../../../ports/outbound/providers/x.port.js';

import { formatXPosts } from './formatters/x-post-formatter.js';

const TOOL_NAME = 'fetchPostsForAI';

const TOOL_DESCRIPTION = `
Fetches latest AI-related posts from a predefined list of X users. No input required.
`.trim();

const USERNAMES = [
    'GoogleAI',
    'nvidia',
    'AnthropicAI',
    'midjourney',
    'sama',
    'demishassabis',
    'AndrewYNg',
    'Ronald_vanLoon',
    'alliekmiller',
    'DeepLearn007',
    'OpenAI',
    'cursor_ai',
];

export function createFetchPostsForAITool(x: XPort, logger: LoggerPort): ToolPort {
    async function fetchPostsForAI(): Promise<string> {
        logger.info('Executing fetchPostsForAI tool...');

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
            logger.info('No AI posts found in the last 72 hours.');
        } else {
            logger.info(`Found ${allPosts.length} AI posts.`, { count: allPosts.length });
        }

        return formatXPosts(allPosts);
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchPostsForAI,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
