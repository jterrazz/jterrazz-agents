import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type AgentPort } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createAINewsJob } from '../adapters/inbound/job-runner/jobs/ai-news.job.js';
import { createCryptoNewsJob } from '../adapters/inbound/job-runner/jobs/crypto-news.job.js';
import { createDevNewsJob } from '../adapters/inbound/job-runner/jobs/dev-news.job.js';
import { createFinanceNewsJob } from '../adapters/inbound/job-runner/jobs/finance-news.job.js';
import { createSpaceEventsJob } from '../adapters/inbound/job-runner/jobs/space-events.job.js';
import { createTechnologyEventsJob } from '../adapters/inbound/job-runner/jobs/technology-events.job.js';
import { NodeCronAdapter } from '../adapters/inbound/job-runner/node-cron.adapter.js';
import { GoogleAIAdapter } from '../adapters/outbound/ai/google-ai.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';

import { createAINewsAgent } from '../agents/ai-news.agent.js';
import { createCryptoNewsAgent } from '../agents/crypto-news.agent.js';
import { createDevNewsAgent } from '../agents/dev-news.agent.js';
import { createFinanceNewsAgent } from '../agents/finance-news.agent.js';
import { createSpaceEventsAgent } from '../agents/space-events.agent.js';
import { createTechnologyEventsAgent } from '../agents/technology-events.agent.js';

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

const ai = Injectable(
    'AI',
    ['Configuration'] as const,
    (config: ConfigurationPort) =>
        new GoogleAIAdapter(config.getOutboundConfiguration().googleApiKey),
);

/**
 * Agents
 */
const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger', 'AI'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort) => {
        return createSpaceEventsAgent({
            ai,
            channelName: 'space',
            chatBot,
            logger,
        });
    },
);

const aiNewsAgent = Injectable(
    'AINewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, configuration: ConfigurationPort) => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createAINewsAgent({
            ai,
            apifyToken,
            channelName: 'ai',
            chatBot,
            logger,
        });
    },
);

const devNewsAgent = Injectable(
    'DevNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, configuration: ConfigurationPort) => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createDevNewsAgent({
            ai,
            apifyToken,
            channelName: 'dev',
            chatBot,
            logger,
        });
    },
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, configuration: ConfigurationPort) => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createCryptoNewsAgent({
            ai,
            apifyToken,
            channelName: 'crypto',
            chatBot,
            logger,
        });
    },
);

const financeNewsAgent = Injectable(
    'FinanceNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Configuration'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, configuration: ConfigurationPort) => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createFinanceNewsAgent({
            ai,
            apifyToken,
            channelName: 'finance',
            chatBot,
            logger,
        });
    },
);

const technologyEventsAgent = Injectable(
    'TechnologyEventsAgent',
    ['ChatBot', 'Logger', 'AI'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort) =>
        createTechnologyEventsAgent({
            ai,
            channelName: 'technology',
            chatBot,
            logger,
        }),
);

/**
 * JobRunner
 */
const jobRunner = Injectable(
    'JobRunner',
    [
        'Logger',
        'ChatBot',
        'AINewsAgent',
        'CryptoNewsAgent',
        'DevNewsAgent',
        'FinanceNewsAgent',
        'SpaceEventsAgent',
        'TechnologyEventsAgent',
    ] as const,
    (
        logger: LoggerPort,
        chatBot: ChatBotPort,
        aiNewsAgent: AgentPort,
        cryptoNewsAgent: AgentPort,
        devNewsAgent: AgentPort,
        financeNewsAgent: AgentPort,
        spaceEventsAgent: AgentPort,
        technologyEventsAgent: AgentPort,
    ) =>
        new NodeCronAdapter(logger, [
            createAINewsJob({
                agent: aiNewsAgent,
                channelName: 'ai',
                chatBot,
                logger,
            }),
            createCryptoNewsJob({
                agent: cryptoNewsAgent,
                channelName: 'crypto',
                chatBot,
                logger,
            }),
            createDevNewsJob({
                agent: devNewsAgent,
                channelName: 'dev',
                chatBot,
                logger,
            }),
            createFinanceNewsJob({
                agent: financeNewsAgent,
                channelName: 'invest',
                chatBot,
                logger,
            }),
            createSpaceEventsJob({
                agent: spaceEventsAgent,
                channelName: 'space',
                chatBot,
                logger,
            }),
            createTechnologyEventsJob({
                agent: technologyEventsAgent,
                channelName: 'tech',
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
        .provides(ai)
        // Agents
        .provides(spaceEventsAgent)
        .provides(aiNewsAgent)
        .provides(devNewsAgent)
        .provides(cryptoNewsAgent)
        .provides(financeNewsAgent)
        .provides(technologyEventsAgent)
        // JobRunner
        .provides(jobRunner);
