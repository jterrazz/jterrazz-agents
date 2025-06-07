import { type XPostPort } from '../../../../../ports/outbound/web/x.port.js';

import { formatTimeAgo } from './time-ago-formatter.js';

export const formatXPost = (post: XPostPort): string => {
    return (
        `Author: ${post.author} (@${post.username})\n` +
        `Time: ${formatTimeAgo(post.createdAt)}\n` +
        `Content: ${post.text}\n` +
        `URL: ${post.url}`
    );
};

export const formatXPosts = (posts: Array<XPostPort>): string => {
    if (posts.length === 0) {
        return 'No recent posts found.';
    }

    return posts.map(formatXPost).join('\n\n');
};
