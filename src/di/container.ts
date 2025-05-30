import { Container, Injectable } from '@snap/ts-inject';

import type { ConfigurationPort } from '../ports/inbound/configuration.port.js';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { NodeConfigAdapter } from '../adapters/inbound/node-config.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';

import { createSpaceEventsAgent } from '../agents/space-events-agent.js';

/**
 * Inbound adapters
 */
const configurationAdapter = Injectable('Configuration', () => new NodeConfigAdapter());

/**
 * Outbound adapters
 */
const chatBot = Injectable(
    'ChatBot',
    ['Configuration'] as const,
    (config: ConfigurationPort) =>
        new DiscordAdapter(config.getOutboundConfiguration().discordBotToken),
);

/**
 * Agent factories
 */
const spaceEventsAgentFactory = Injectable(
    'SpaceEventsAgent',
    ['ChatBot'] as const,
    (chatBot: ChatBotPort) =>
        createSpaceEventsAgent({
            channelName: 'space',
            chatBot,
        }),
);

/**
 * Container configuration
 */
export const createContainer = () =>
    Container
        // Outbound adapters
        .provides(configurationAdapter)
        .provides(chatBot)
        // Agents
        .provides(spaceEventsAgentFactory);
