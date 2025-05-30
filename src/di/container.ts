import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createCryptoNewsJob } from '../adapters/inbound/job-runner/jobs/crypto-news.job.js';
import { createInvestNewsJob } from '../adapters/inbound/job-runner/jobs/invest-news.job.js';
import { createSpaceEventsJob } from '../adapters/inbound/job-runner/jobs/space-events.job.js';
import { NodeCronAdapter } from '../adapters/inbound/job-runner/node-cron.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';

import { createSpaceEventsAgent } from '../agents/space-events.agent.js';

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
 * JobRunner
 */
const jobRunner = Injectable(
    'JobRunner',
    ['Logger', 'ChatBot'] as const,
    (logger: LoggerPort, chatBot: ChatBotPort) =>
        new NodeCronAdapter(logger, [
            createSpaceEventsJob({
                channelName: 'space',
                chatBot,
                logger,
            }),
            createInvestNewsJob({
                channelName: 'invest',
                chatBot,
                logger,
            }),
            createCryptoNewsJob({
                channelName: 'crypto',
                chatBot,
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
        // JobRunner
        .provides(jobRunner);
