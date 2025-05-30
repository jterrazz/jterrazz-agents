import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
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
            level: 'debug',
            prettyPrint: true,
        }),
);

/**
 * Outbound adapters
 */
const chatBot = Injectable(
    'ChatBot',
    ['Configuration', 'Logger'] as const,
    (config: ConfigurationPort, logger: LoggerPort) =>
        new DiscordAdapter(config.getOutboundConfiguration().discordBotToken, logger),
);

/**
 * Agents
 */
const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort) =>
        createSpaceEventsAgent({
            channelName: 'space',
            chatBot,
            logger,
        }),
);

/**
 * Container
 */
export const createContainer = () =>
    Container
        // Inbound adapters
        .provides(configurationAdapter)
        // Outbound adapters
        .provides(logger)
        .provides(chatBot)
        // Agents
        .provides(spaceEventsAgent);
