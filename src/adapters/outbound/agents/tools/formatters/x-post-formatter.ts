import { type XPostPort } from '../../../../../ports/outbound/web/x.port.js';

export const formatXPost = (post: XPostPort & { username: string }): string => {
    return (
        `Author: ${post.author} (@${post.username})\n` +
        `Time: ${post.timeAgo}\n` +
        `Content: ${post.text}\n` +
        `URL: ${post.url}`
    );
};

export const formatXPosts = (posts: Array<XPostPort & { username: string }>): string => {
    return posts.map(formatXPost).join('\n\n');
}; 