import { afterEach, beforeEach, describe, expect, it, mockOfDate } from '@jterrazz/test';

import { formatXPost, formatXPosts } from '../x-post-formatter.js';

describe('x-post-formatter', () => {
    const now = new Date('2024-03-20T12:00:00Z');

    beforeEach(() => {
        mockOfDate.set(now);
    });

    afterEach(() => {
        mockOfDate.reset();
    });

    describe('formatXPost', () => {
        it('should format a single post correctly', () => {
            const post = {
                author: 'John Doe',
                createdAt: new Date('2024-03-20T10:00:00Z'), // 2 hours ago
                id: '123',
                text: 'Hello world!',
                url: 'https://x.com/johndoe/123',
                username: 'johndoe',
            };

            const formatted = formatXPost(post);
            expect(formatted).toBe(
                'Author: John Doe (@johndoe)\n' +
                    'Time: posted 2 hours ago\n' +
                    'Content: Hello world!\n' +
                    'URL: https://x.com/johndoe/123',
            );
        });

        it('should handle posts with special characters', () => {
            const post = {
                author: 'John & Jane',
                createdAt: new Date('2024-03-20T11:00:00Z'), // 1 hour ago
                id: '456',
                text: 'Hello\nworld!',
                url: 'https://x.com/johnjane/456',
                username: 'johnjane',
            };

            const formatted = formatXPost(post);
            expect(formatted).toBe(
                'Author: John & Jane (@johnjane)\n' +
                    'Time: posted 1 hour ago\n' +
                    'Content: Hello\\nworld!\n' +
                    'URL: https://x.com/johnjane/456',
            );
        });
    });

    describe('formatXPosts', () => {
        it('should format multiple posts with proper spacing', () => {
            const posts = [
                {
                    author: 'John Doe',
                    createdAt: new Date('2024-03-20T10:00:00Z'), // 2 hours ago
                    id: '123',
                    text: 'First post',
                    url: 'https://x.com/johndoe/123',
                    username: 'johndoe',
                },
                {
                    author: 'Jane Smith',
                    createdAt: new Date('2024-03-20T11:00:00Z'), // 1 hour ago
                    id: '456',
                    text: 'Second post',
                    url: 'https://x.com/janesmith/456',
                    username: 'janesmith',
                },
            ];

            const formatted = formatXPosts(posts);
            expect(formatted).toBe(
                'Author: John Doe (@johndoe)\n' +
                    'Time: posted 2 hours ago\n' +
                    'Content: First post\n' +
                    'URL: https://x.com/johndoe/123\n\n' +
                    'Author: Jane Smith (@janesmith)\n' +
                    'Time: posted 1 hour ago\n' +
                    'Content: Second post\n' +
                    'URL: https://x.com/janesmith/456',
            );
        });

        it('should handle empty posts array', () => {
            const formatted = formatXPosts([]);
            expect(formatted).toBe('No recent posts found.');
        });

        it('should handle single post array', () => {
            const posts = [
                {
                    author: 'John Doe',
                    createdAt: new Date('2024-03-20T11:00:00Z'), // 1 hour ago
                    id: '123',
                    text: 'Single post',
                    url: 'https://x.com/johndoe/123',
                    username: 'johndoe',
                },
            ];

            const formatted = formatXPosts(posts);
            expect(formatted).toBe(
                'Author: John Doe (@johndoe)\n' +
                    'Time: posted 1 hour ago\n' +
                    'Content: Single post\n' +
                    'URL: https://x.com/johndoe/123',
            );
        });
    });
});
