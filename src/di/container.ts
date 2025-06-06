import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type AgentPort } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';
import { type Tool } from '../ports/outbound/tool.port.js';

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
import { createFetchAITweetsTool } from '../agents/tools/fetch-ai-tweets.tool.js';
import { createFetchCryptoTweetsTool } from '../agents/tools/fetch-crypto-tweets.tool.js';
import { createFetchDevTweetsTool } from '../agents/tools/fetch-dev-tweets.tool.js';
import { createFetchFinancialTweetsTool } from '../agents/tools/fetch-financial-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from '../agents/tools/fetch-recent-bot-messages.tool.js';
import { createGetCurrentDateTool } from '../agents/tools/get-current-date.tool.js';

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
 * Tools
 */
const fetchRecentBotMessagesTool = Injectable(
    'FetchRecentBotMessagesTool',
    ['ChatBot'] as const,
    (chatBot: ChatBotPort): Tool =>
        createFetchRecentBotMessagesTool({ channelName: 'finance', chatBot }),
);

const fetchDevRecentBotMessagesTool = Injectable(
    'FetchDevRecentBotMessagesTool',
    ['ChatBot'] as const,
    (chatBot: ChatBotPort): Tool =>
        createFetchRecentBotMessagesTool({ channelName: 'dev', chatBot }),
);

const fetchCryptoRecentBotMessagesTool = Injectable(
    'FetchCryptoRecentBotMessagesTool',
    ['ChatBot'] as const,
    (chatBot: ChatBotPort): Tool =>
        createFetchRecentBotMessagesTool({ channelName: 'crypto', chatBot }),
);

const fetchAINewsRecentBotMessagesTool = Injectable(
    'FetchAINewsRecentBotMessagesTool',
    ['ChatBot'] as const,
    (chatBot: ChatBotPort): Tool =>
        createFetchRecentBotMessagesTool({ channelName: 'ai', chatBot }),
);

const fetchFinancialTweetsTool = Injectable(
    'FetchFinancialTweetsTool',
    ['Configuration'] as const,
    (configuration: ConfigurationPort): Tool => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createFetchFinancialTweetsTool(apifyToken);
    },
);

const fetchDevTweetsTool = Injectable(
    'FetchDevTweetsTool',
    ['Configuration'] as const,
    (configuration: ConfigurationPort): Tool => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createFetchDevTweetsTool(apifyToken);
    },
);

const fetchCryptoTweetsTool = Injectable(
    'FetchCryptoTweetsTool',
    ['Configuration'] as const,
    (configuration: ConfigurationPort): Tool => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createFetchCryptoTweetsTool(apifyToken);
    },
);

const fetchAITweetsTool = Injectable(
    'FetchAITweetsTool',
    ['Configuration'] as const,
    (configuration: ConfigurationPort): Tool => {
        const { apifyToken } = configuration.getOutboundConfiguration();
        return createFetchAITweetsTool(apifyToken);
    },
);

const getCurrentDateTool = Injectable(
    'GetCurrentDateTool',
    [] as const,
    (): Tool => createGetCurrentDateTool(),
);

/**
 * Agents
 */
const financeNewsAgent = Injectable(
    'FinanceNewsAgent',
    [
        'ChatBot',
        'Logger',
        'AI',
        'FetchRecentBotMessagesTool',
        'FetchFinancialTweetsTool',
        'GetCurrentDateTool',
    ] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        fetchRecentBotMessagesTool: Tool,
        fetchFinancialTweetsTool: Tool,
        getCurrentDateTool: Tool,
    ) => {
        return createFinanceNewsAgent({
            ai,
            chatBot,
            logger,
            tools: [fetchRecentBotMessagesTool, fetchFinancialTweetsTool, getCurrentDateTool],
        });
    },
);

const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'GetCurrentDateTool'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, getCurrentDateTool: Tool) => {
        return createSpaceEventsAgent({
            ai,
            chatBot,
            logger,
            tools: [getCurrentDateTool],
        });
    },
);

const aiNewsAgent = Injectable(
    'AINewsAgent',
    [
        'ChatBot',
        'Logger',
        'AI',
        'FetchAINewsRecentBotMessagesTool',
        'FetchAITweetsTool',
        'GetCurrentDateTool',
    ] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        fetchRecentBotMessagesTool: Tool,
        fetchAITweetsTool: Tool,
        getCurrentDateTool: Tool,
    ) => {
        return createAINewsAgent({
            ai,
            chatBot,
            logger,
            tools: [fetchRecentBotMessagesTool, fetchAITweetsTool, getCurrentDateTool],
        });
    },
);

const devNewsAgent = Injectable(
    'DevNewsAgent',
    [
        'ChatBot',
        'Logger',
        'AI',
        'FetchDevRecentBotMessagesTool',
        'FetchDevTweetsTool',
        'GetCurrentDateTool',
    ] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        fetchRecentBotMessagesTool: Tool,
        fetchDevTweetsTool: Tool,
        getCurrentDateTool: Tool,
    ) => {
        return createDevNewsAgent({
            ai,
            chatBot,
            logger,
            tools: [fetchRecentBotMessagesTool, fetchDevTweetsTool, getCurrentDateTool],
        });
    },
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    [
        'ChatBot',
        'Logger',
        'AI',
        'FetchCryptoRecentBotMessagesTool',
        'FetchCryptoTweetsTool',
        'GetCurrentDateTool',
    ] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        fetchRecentBotMessagesTool: Tool,
        fetchCryptoTweetsTool: Tool,
        getCurrentDateTool: Tool,
    ) => {
        return createCryptoNewsAgent({
            ai,
            chatBot,
            logger,
            tools: [fetchRecentBotMessagesTool, fetchCryptoTweetsTool, getCurrentDateTool],
        });
    },
);

const technologyEventsAgent = Injectable(
    'TechnologyEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'FetchRecentBotMessagesTool', 'GetCurrentDateTool'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        fetchRecentBotMessagesTool: Tool,
        getCurrentDateTool: Tool,
    ) =>
        createTechnologyEventsAgent({
            ai,
            chatBot,
            logger,
            tools: [fetchRecentBotMessagesTool, getCurrentDateTool],
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
        // Tools
        .provides(fetchRecentBotMessagesTool)
        .provides(fetchDevRecentBotMessagesTool)
        .provides(fetchCryptoRecentBotMessagesTool)
        .provides(fetchAINewsRecentBotMessagesTool)
        .provides(fetchFinancialTweetsTool)
        .provides(fetchDevTweetsTool)
        .provides(fetchCryptoTweetsTool)
        .provides(fetchAITweetsTool)
        .provides(getCurrentDateTool)
        // Agents
        .provides(spaceEventsAgent)
        .provides(aiNewsAgent)
        .provides(devNewsAgent)
        .provides(cryptoNewsAgent)
        .provides(financeNewsAgent)
        .provides(technologyEventsAgent)
        // JobRunner
        .provides(jobRunner);
