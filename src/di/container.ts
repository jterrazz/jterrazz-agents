import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createInvestNewsJob } from '../adapters/inbound/job-runner/jobs/invest-news.job.js';
import { createTechEventsJob } from '../adapters/inbound/job-runner/jobs/tech-events.job.js';
import { NodeCronAdapter } from '../adapters/inbound/job-runner/node-cron.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';

import { createAINewsAgent } from '../agents/ai-news.agent.js';
import { createCryptoNewsAgent } from '../agents/crypto-news.agent.js';
import { createDevNewsAgent } from '../agents/dev-news.agent.js';
import { createSpaceEventsAgent } from '../agents/space-events.agent.js';
import { createTechEventsAgent } from '../agents/tech-events.agent.js';

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
    ['ChatBot', 'Logger', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, configuration: ConfigurationPort) => {
        const { googleApiKey } = configuration.getOutboundConfiguration();
        return createSpaceEventsAgent({
            apiKey: googleApiKey,
            channelName: 'space',
            chatBot,
            logger,
        });
    },
);

const aiNewsAgent = Injectable(
    'AINewsAgent',
    ['ChatBot', 'Logger', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, configuration: ConfigurationPort) => {
        const { apifyToken, googleApiKey } = configuration.getOutboundConfiguration();
        return createAINewsAgent({
            apifyToken,
            channelName: 'ai',
            chatBot,
            googleApiKey,
            logger,
        });
    },
);

const devNewsAgent = Injectable(
    'DevNewsAgent',
    ['ChatBot', 'Logger', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, configuration: ConfigurationPort) =>
        createDevNewsAgent({
            apiKey: configuration.getOutboundConfiguration().googleApiKey,
            channelName: 'dev',
            chatBot,
            logger,
        }),
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    ['ChatBot', 'Logger', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, configuration: ConfigurationPort) =>
        createCryptoNewsAgent({
            apiKey: configuration.getOutboundConfiguration().googleApiKey,
            channelName: 'crypto',
            chatBot,
            logger,
        }),
);

const techEventsAgent = Injectable(
    'TechEventsAgent',
    ['ChatBot', 'Logger', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, configuration: ConfigurationPort) =>
        createTechEventsAgent({
            apiKey: configuration.getOutboundConfiguration().googleApiKey,
            channelName: 'tech',
            chatBot,
            logger,
        }),
);

/**
 * JobRunner
 */
const jobRunner = Injectable(
    'JobRunner',
    ['Logger', 'ChatBot', 'Configuration'] as const,
    (logger: LoggerPort, chatBot: ChatBotPort, configuration: ConfigurationPort) =>
        new NodeCronAdapter(logger, [
            // createSpaceEventsJob({
            //     channelName: 'space',
            //     chatBot,
            //     configuration,
            //     logger,
            // }),
            // createInvestNewsJob({
            //     channelName: 'invest',
            //     chatBot,
            //     configuration,
            //     logger,
            // }),
            // createCryptoNewsJob({
            //     channelName: 'crypto',
            //     chatBot,
            //     configuration,
            //     logger,
            // }),
            // createAINewsJob({
            //     channelName: 'ai',
            //     chatBot,
            //     configuration,
            //     logger,
            // }),
            // createDevNewsJob({
            //     channelName: 'dev',
            //     chatBot,
            //     configuration,
            //     logger,
            // }),
            // createTechEventsJob({
            //     channelName: 'tech',
            //     chatBot,
            //     configuration,
            //     logger,
            // }),
            createInvestNewsJob({
                channelName: '__tests__',
                chatBot,
                configuration,
                logger,
            }),
            createTechEventsJob({
                channelName: '__tests__',
                chatBot,
                configuration,
                logger,
            }),
        ]),
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
        .provides(spaceEventsAgent)
        .provides(aiNewsAgent)
        .provides(devNewsAgent)
        .provides(cryptoNewsAgent)
        .provides(techEventsAgent)
        // JobRunner
        .provides(jobRunner);
