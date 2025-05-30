import { describe, expect, test } from '@jterrazz/test';

import { createNitterTwitterAdapter } from '../nitter-twitter.adapter.js';

describe('NitterTwitterAdapter', () => {
    test('it should fetch and parse latest messages from KobeissiLetter', async () => {
        // Given
        const adapter = createNitterTwitterAdapter();
        // When
        const messages = await adapter.fetchLatestMessages('KobeissiLetter');
        // Then
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThan(0);
        for (const message of messages) {
            expect(typeof message.id).toBe('string');
            expect(typeof message.text).toBe('string');
            expect(typeof message.author).toBe('string');
            expect(message.url).toContain('nitter.net');
            expect(message.createdAt instanceof Date).toBe(true);
        }
        // Log for inspection
        console.log(messages);
    }, 30000); // 30 seconds timeout
});
