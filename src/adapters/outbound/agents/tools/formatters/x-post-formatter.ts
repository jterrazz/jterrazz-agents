import { type XPostPort } from '../../../../../ports/outbound/web/x.port.js';

import { formatTimeAgo } from './time-ago-formatter.js';

export const formatXPost = (post: XPostPort): string => {
    return `Author: ${post.author} (@${post.username})
Time: ${formatTimeAgo(post.createdAt)}
Content: ${post.text.replace(/\n/g, '\\n')}
URL: ${post.url}`;
};

export const formatXPosts = (posts: Array<XPostPort>): string => {
    if (posts.length === 0) {
        return 'No recent posts found.';
    }

    return posts.map(formatXPost).join('\n\n');
};
