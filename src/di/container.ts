import { type LoggerLevel, PinoLoggerAdapter } from '@jterrazz/logger';
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

const logger = Injectable(
    'Logger',
    () =>
        new PinoLoggerAdapter({
            level: 'info' as LoggerLevel,
            prettyPrint: true,
        }),
);

/**
 * Outbound adapters
 */
const chatBot = Injectable(
    'ChatBot',
    ['Configuration', 'Logger'] as const,
    (config: ConfigurationPort, logger) =>
        new DiscordAdapter(config.getOutboundConfiguration().discordBotToken, logger),
);

/**
 * Agent factories
 */
const spaceEventsAgentFactory = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger'] as const,
    (chatBot: ChatBotPort, logger) =>
        createSpaceEventsAgent({
            channelName: 'space',
            chatBot,
            logger,
        }),
);

/**
 * Container configuration
 */
export const createContainer = () =>
    Container
        // Outbound adapters
        .provides(configurationAdapter)
        .provides(logger)
        .provides(chatBot)
        // Agents
        .provides(spaceEventsAgentFactory);
