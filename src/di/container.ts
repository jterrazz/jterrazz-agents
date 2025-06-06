import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type AgentPort, type AvailableTools } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createAINewsJob } from '../adapters/inbound/job-runner/jobs/ai-news.job.js';
import { createCryptoNewsJob } from '../adapters/inbound/job-runner/jobs/crypto-news.job.js';
import { createDevelopmentNewsJob } from '../adapters/inbound/job-runner/jobs/development-news.job.js';
import { createFinanceNewsJob } from '../adapters/inbound/job-runner/jobs/finance-news.job.js';
import { createSpaceEventsJob } from '../adapters/inbound/job-runner/jobs/space-events.job.js';
import { createTechnologyEventsJob } from '../adapters/inbound/job-runner/jobs/technology-events.job.js';
import { NodeCronAdapter } from '../adapters/inbound/job-runner/node-cron.adapter.js';
import { GoogleAIAdapter } from '../adapters/outbound/ai/google-ai.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';

import { createAINewsAgent } from '../agents/ai-news.agent.js';
import { createCryptoNewsAgent } from '../agents/crypto-news.agent.js';
import { createDevelopmentNewsAgent } from '../agents/development-news.agent.js';
import { createFinanceNewsAgent } from '../agents/finance-news.agent.js';
import { createSpaceEventsAgent } from '../agents/space-events.agent.js';
import { createTechnologyEventsAgent } from '../agents/technology-events.agent.js';
import { createFetchAITweetsTool } from '../agents/tools/fetch-ai-tweets.tool.js';
import { createFetchCryptoTweetsTool } from '../agents/tools/fetch-crypto-tweets.tool.js';
import { createFetchDevelopmentTweetsTool } from '../agents/tools/fetch-development-tweets.tool.js';
import { createFetchFinancialTweetsTool } from '../agents/tools/fetch-financial-tweets.tool.js';
import { createFetchTechnologyEventsTool } from '../agents/tools/fetch-technology-events.tool.js';
import { createGetChatBotMessagesTool } from '../agents/tools/get-chatbot-messages.tool.js';
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
const tools = Injectable(
    'Tools',
    ['ChatBot', 'Configuration'] as const,
    (chatBot: ChatBotPort, config: ConfigurationPort): AvailableTools => {
        const { apifyToken } = config.getOutboundConfiguration();
        return {
            fetchAITweets: createFetchAITweetsTool(apifyToken),
            fetchCryptoTweets: createFetchCryptoTweetsTool(apifyToken),
            fetchDevelopmentTweets: createFetchDevelopmentTweetsTool(apifyToken),
            fetchFinancialTweets: createFetchFinancialTweetsTool(apifyToken),
            fetchTechnologyEvents: createFetchTechnologyEventsTool(),
            getChatBotMessages: {
                ai: createGetChatBotMessagesTool({ channelName: 'ai', chatBot }),
                crypto: createGetChatBotMessagesTool({ channelName: 'crypto', chatBot }),
                development: createGetChatBotMessagesTool({ channelName: 'development', chatBot }),
                finance: createGetChatBotMessagesTool({ channelName: 'finance', chatBot }),
                space: createGetChatBotMessagesTool({ channelName: 'space', chatBot }),
                technology: createGetChatBotMessagesTool({
                    channelName: 'technology',
                    chatBot,
                }),
            },
            getCurrentDate: createGetCurrentDateTool(),
        };
    },
);

/**
 * Agents
 */
const financeNewsAgent = Injectable(
    'FinanceNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableTools) => {
        return createFinanceNewsAgent({
            ai,
            channelName: 'invest',
            chatBot,
            logger,
            tools,
        });
    },
);

const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableTools) => {
        return createSpaceEventsAgent({
            ai,
            channelName: 'space',
            chatBot,
            logger,
            tools,
        });
    },
);

const aiNewsAgent = Injectable(
    'AINewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableTools) => {
        return createAINewsAgent({
            ai,
            channelName: 'ai',
            chatBot,
            logger,
            tools,
        });
    },
);

const developmentNewsAgent = Injectable(
    'DevelopmentNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableTools) => {
        return createDevelopmentNewsAgent({
            ai,
            channelName: 'development',
            chatBot,
            logger,
            tools,
        });
    },
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableTools) => {
        return createCryptoNewsAgent({
            ai,
            channelName: 'crypto',
            chatBot,
            logger,
            tools,
        });
    },
);

const technologyEventsAgent = Injectable(
    'TechnologyEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableTools) =>
        createTechnologyEventsAgent({
            ai,
            channelName: 'tech',
            chatBot,
            logger,
            tools,
        }),
);

/**
 * JobRunner
 */
const jobRunner = Injectable(
    'JobRunner',
    [
        'Logger',
        'AINewsAgent',
        'CryptoNewsAgent',
        'DevelopmentNewsAgent',
        'FinanceNewsAgent',
        'SpaceEventsAgent',
        'TechnologyEventsAgent',
    ] as const,
    (
        logger: LoggerPort,
        aiNewsAgent: AgentPort,
        cryptoNewsAgent: AgentPort,
        developmentNewsAgent: AgentPort,
        financeNewsAgent: AgentPort,
        spaceEventsAgent: AgentPort,
        technologyEventsAgent: AgentPort,
    ) =>
        new NodeCronAdapter(logger, [
            createAINewsJob({
                agent: aiNewsAgent,
            }),
            createCryptoNewsJob({
                agent: cryptoNewsAgent,
            }),
            createDevelopmentNewsJob({
                agent: developmentNewsAgent,
            }),
            createFinanceNewsJob({
                agent: financeNewsAgent,
            }),
            createSpaceEventsJob({
                agent: spaceEventsAgent,
            }),
            createTechnologyEventsJob({
                agent: technologyEventsAgent,
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
        .provides(tools)
        // Agents
        .provides(spaceEventsAgent)
        .provides(aiNewsAgent)
        .provides(developmentNewsAgent)
        .provides(cryptoNewsAgent)
        .provides(financeNewsAgent)
        .provides(technologyEventsAgent)
        // JobRunner
        .provides(jobRunner);
