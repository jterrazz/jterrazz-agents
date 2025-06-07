import { afterEach, beforeEach, describe, expect, it, mockOfDate } from '@jterrazz/test';

import { formatChatBotMessage, formatChatBotMessages } from '../chatbot-message-formatter.js';

describe('chatbot-message-formatter', () => {
    const now = new Date('2024-06-13T12:34:56.789Z');

    beforeEach(() => {
        mockOfDate.set(now);
    });

    afterEach(() => {
        mockOfDate.reset();
    });

    describe('formatChatBotMessage', () => {
        it('should format a single message with date and content', () => {
            const message = {
                content: 'Hello world!',
                date: new Date('2024-06-13T12:34:56.789Z'),
            };

            const formatted = formatChatBotMessage(message);
            expect(formatted).toContain('Date: June 13, 2024 at 12:34 PM');
            expect(formatted).toContain('posted 0 seconds ago');
            expect(formatted).toContain('Content: Hello world!');
        });

        it('should handle messages with special characters', () => {
            const message = {
                content: 'Message with\nnewlines & special chars!',
                date: new Date('2024-06-13T12:34:56.789Z'),
            };

            const formatted = formatChatBotMessage(message);
            expect(formatted).toContain('Message with\nnewlines & special chars!');
        });
    });

    describe('formatChatBotMessages', () => {
        it('should handle empty messages array', () => {
            const messages: Array<{ content: string; date: Date }> = [];

            const formatted = formatChatBotMessages(messages);
            expect(formatted).toBe('No messages posted by the chatbot.');
        });

        it('should format single message array', () => {
            const messages = [
                {
                    content: 'Single message',
                    date: new Date('2024-06-13T12:34:56.789Z'),
                },
            ];

            const formatted = formatChatBotMessages(messages);
            expect(formatted).toContain('Single message');
            expect(formatted).toContain('June 13, 2024 at 12:34 PM');
            expect(formatted).toContain('posted 0 seconds ago');
        });

        it('should format multiple messages with proper separation', () => {
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

            const formatted = formatChatBotMessages(messages);
            expect(formatted).toContain('First message');
            expect(formatted).toContain('Second message');
            expect(formatted).toContain('June 13, 2024 at 12:34 PM');
            expect(formatted).toContain('June 13, 2024 at 1:34 PM');
            // Verify double line separation between messages
            expect(formatted).toMatch(/Content: First message\n\n\nDate:/);
        });
    });
});
