import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

vi.mock('config', () => {
    const mockConfig = mockDeep<typeof config>();
    return {
        default: mockConfig,
    };
});

import { beforeEach, describe, expect, test } from '@jterrazz/test';
import config from 'config';

import { type Configuration, NodeConfigAdapter } from '../node-config.adapter.js';

describe('NodeConfigAdapter', () => {
    const mockConfig: Configuration = {
        inbound: {
            jobs: {
                aiNews: { enabled: true },
                cryptoNews: { enabled: true },
                developmentNews: { enabled: true },
                financeNews: { enabled: true },
                spaceEvents: { enabled: true },
                technologyEvents: { enabled: true },
            },
        },
        outbound: {
            apify: {
                token: 'test-apify-token',
            },
            discord: {
                botToken: 'test-discord-token',
                channels: {
                    ai: 'test-ai-channel',
                    crypto: 'test-crypto-channel',
                    development: 'test-development-channel',
                    finance: 'test-finance-channel',
                    space: 'test-space-channel',
                    technology: 'test-technology-channel',
                },
            },
            openrouter: {
                apiKey: 'test-openrouter-key',
            },
        },
    };

    const createMockConfig = (overrides: Record<string, unknown> = {}) => {
        return (path: string) => {
            if (path in overrides) return overrides[path];

            const parts = path.split('.');
            let current: unknown = mockConfig;
            for (const part of parts) {
                if (typeof current === 'object' && current !== null) {
                    current = (current as Record<string, unknown>)[part];
                }
            }
            return current;
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(config.get).mockImplementation(createMockConfig());
    });

    test('should return correct outbound configuration', () => {
        const adapter = new NodeConfigAdapter();
        const config = adapter.getOutboundConfiguration();

        expect(config).toEqual({
            apifyToken: 'test-apify-token',
            discordBotToken: 'test-discord-token',
            discordChannels: {
                ai: 'test-ai-channel',
                crypto: 'test-crypto-channel',
                development: 'test-development-channel',
                finance: 'test-finance-channel',
                space: 'test-space-channel',
                technology: 'test-technology-channel',
            },
            openrouterApiKey: 'test-openrouter-key',
        });
    });

    test('should return correct inbound configuration', () => {
        const adapter = new NodeConfigAdapter();
        const config = adapter.getInboundConfiguration();

        expect(config).toEqual({
            jobs: {
                aiNews: { enabled: true },
                cryptoNews: { enabled: true },
                developmentNews: { enabled: true },
                financeNews: { enabled: true },
                spaceEvents: { enabled: true },
                technologyEvents: { enabled: true },
            },
        });
    });

    test('should throw error when apify token is missing', () => {
        vi.mocked(config.get).mockImplementation(
            createMockConfig({
                'outbound.apify.token': '',
            }),
        );

        expect(() => new NodeConfigAdapter()).toThrow('An Apify token is required');
    });

    test('should throw error when discord bot token is missing', () => {
        vi.mocked(config.get).mockImplementation(
            createMockConfig({
                'outbound.discord.botToken': '',
            }),
        );

        expect(() => new NodeConfigAdapter()).toThrow('A Discord bot token is required');
    });

    test('should throw error when openrouter api key is missing', () => {
        vi.mocked(config.get).mockImplementation(
            createMockConfig({
                'outbound.openrouter.apiKey': '',
            }),
        );

        expect(() => new NodeConfigAdapter()).toThrow('An OpenRouter API key is required');
    });
});
