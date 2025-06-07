import { describe, expect, it } from '@jterrazz/test';

import { formatChatBotMessage, formatChatBotMessages } from '../chatbot-message-formatter.js';

describe('chatbot-message-formatter', () => {
    describe('formatChatBotMessage', () => {
        it('should format a single message correctly', () => {
            const message = {
                content: 'Hello world!',
                date: new Date('2024-06-13T12:34:56.789Z'),
            };

            const formatted = formatChatBotMessage(message);
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM (posted just now)\n' +
                'Content: Hello world!\n'
            );
        });

        it('should handle messages with special characters', () => {
            const message = {
                content: 'Message with\nnewlines & special chars!',
                date: new Date('2024-06-13T12:34:56.789Z'),
            };

            const formatted = formatChatBotMessage(message);
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM (posted just now)\n' +
                'Content: Message with\nnewlines & special chars!\n'
            );
        });
    });

    describe('formatChatBotMessages', () => {
        it('should format multiple messages with proper spacing', () => {
            const messages = [
                {
                    content: 'First message',
                    date: new Date('2024-06-13T12:34:56.789Z'),
                },
                {
                    content: 'Second message',
                    date: new Date('2024-06-13T13:34:56.789Z'),
                },
            ];

            const formatted = formatChatBotMessages(messages, 'test-channel');
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM (posted just now)\n' +
                'Content: First message\n\n' +
                'Date: June 13, 2024 at 1:34 PM (posted just now)\n' +
                'Content: Second message\n'
            );
        });

        it('should handle empty messages array', () => {
            const messages: Array<{ content: string; date: Date }> = [];

            const formatted = formatChatBotMessages(messages, 'test-channel');
            expect(formatted).toBe('No recent messages found in #test-channel channel.');
        });

        it('should handle single message array', () => {
            const messages = [
                {
                    content: 'Single message',
                    date: new Date('2024-06-13T12:34:56.789Z'),
                },
            ];

            const formatted = formatChatBotMessages(messages, 'ai-news');
            expect(formatted).toBe(
                'Date: June 13, 2024 at 12:34 PM (posted just now)\n' +
                'Content: Single message\n'
            );
        });

        it('should handle different channel names', () => {
            const messages: Array<{ content: string; date: Date }> = [];

            expect(formatChatBotMessages(messages, 'crypto')).toBe(
                'No recent messages found in #crypto channel.'
            );
            expect(formatChatBotMessages(messages, 'development')).toBe(
                'No recent messages found in #development channel.'
            );
        });
    });
}); 