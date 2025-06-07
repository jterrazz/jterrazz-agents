import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type AgentPort, type AvailableAgentTools } from '../ports/outbound/agents.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';
import { type XPort } from '../ports/outbound/web/x.port.js';

import { createAINewsJob } from '../adapters/inbound/job-runner/jobs/ai-news.job.js';
import { createCryptoNewsJob } from '../adapters/inbound/job-runner/jobs/crypto-news.job.js';
import { createDevelopmentNewsJob } from '../adapters/inbound/job-runner/jobs/development-news.job.js';
import { createFinanceNewsJob } from '../adapters/inbound/job-runner/jobs/finance-news.job.js';
import { createSpaceEventsJob } from '../adapters/inbound/job-runner/jobs/space-events.job.js';
import { createTechnologyEventsJob } from '../adapters/inbound/job-runner/jobs/technology-events.job.js';
import { NodeCronAdapter } from '../adapters/inbound/job-runner/node-cron.adapter.js';
import { AINewsAgent } from '../adapters/outbound/agents/ai-news.agent.js';
import { CryptoNewsAgent } from '../adapters/outbound/agents/crypto-news.agent.js';
import { DevelopmentNewsAgent } from '../adapters/outbound/agents/development-news.agent.js';
import { FinanceNewsAgent } from '../adapters/outbound/agents/finance-news.agent.js';
import { SpaceEventsAgent } from '../adapters/outbound/agents/space-events.agent.js';
import { TechnologyEventsAgent } from '../adapters/outbound/agents/technology-events.agent.js';
import { createFetchChatBotMessagesTool } from '../adapters/outbound/agents/tools/fetch-chatbot-messages.tool.js';
import { createFetchEventsForSpaceTool } from '../adapters/outbound/agents/tools/fetch-events-for-space.tool.js';
import { createFetchEventsForTechnologyTool } from '../adapters/outbound/agents/tools/fetch-events-for-technology.tool.js';
import { createFetchPostsForAITool } from '../adapters/outbound/agents/tools/fetch-posts-for-ai.tool.js';
import { createFetchPostsForCryptoTool } from '../adapters/outbound/agents/tools/fetch-posts-for-crypto.tool.js';
import { createFetchPostsForDevelopmentTool } from '../adapters/outbound/agents/tools/fetch-posts-for-development.tool.js';
import { createFetchPostsForFinanceTool } from '../adapters/outbound/agents/tools/fetch-posts-for-finance.tool.js';
import { createGetCurrentDateTool } from '../adapters/outbound/agents/tools/get-current-date.tool.js';
import { GoogleAIAdapter } from '../adapters/outbound/ai/google-ai.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';
import { createXAdapter } from '../adapters/outbound/web/x.adapter.js';

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

const x = Injectable('X', ['Configuration'] as const, (config: ConfigurationPort): XPort => {
    const { apifyToken } = config.getOutboundConfiguration();
    return createXAdapter(apifyToken);
});

/**
 * Tools
 */
const tools = Injectable(
    'Tools',
    ['ChatBot', 'Configuration', 'X'] as const,
    (chatBot: ChatBotPort, config: ConfigurationPort, x: XPort): AvailableAgentTools => {
        return {
            fetchChatBotMessages: {
                ai: createFetchChatBotMessagesTool({ channelName: 'ai', chatBot }),
                crypto: createFetchChatBotMessagesTool({ channelName: 'crypto', chatBot }),
                development: createFetchChatBotMessagesTool({
                    channelName: 'development',
                    chatBot,
                }),
                finance: createFetchChatBotMessagesTool({ channelName: 'finance', chatBot }),
                space: createFetchChatBotMessagesTool({ channelName: 'space', chatBot }),
                technology: createFetchChatBotMessagesTool({
                    channelName: 'technology',
                    chatBot,
                }),
            },
            fetchEventsForSpace: createFetchEventsForSpaceTool(),
            fetchEventsForTechnology: createFetchEventsForTechnologyTool(),
            fetchPostsForAI: createFetchPostsForAITool(x),
            fetchPostsForCrypto: createFetchPostsForCryptoTool(x),
            fetchPostsForDevelopment: createFetchPostsForDevelopmentTool(x),
            fetchPostsForFinance: createFetchPostsForFinanceTool(x),
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
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableAgentTools) =>
        new FinanceNewsAgent({
            ai,
            channelName: 'invest',
            chatBot,
            logger,
            tools,
        }),
);

const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableAgentTools) =>
        new SpaceEventsAgent({
            ai,
            channelName: 'space',
            chatBot,
            logger,
            tools,
        }),
);

const aiNewsAgent = Injectable(
    'AINewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableAgentTools) =>
        new AINewsAgent({
            ai,
            channelName: 'ai',
            chatBot,
            logger,
            tools,
        }),
);

const developmentNewsAgent = Injectable(
    'DevelopmentNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableAgentTools) =>
        new DevelopmentNewsAgent({
            ai,
            channelName: 'development',
            chatBot,
            logger,
            tools,
        }),
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableAgentTools) =>
        new CryptoNewsAgent({
            ai,
            channelName: 'crypto',
            chatBot,
            logger,
            tools,
        }),
);

const technologyEventsAgent = Injectable(
    'TechnologyEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools'] as const,
    (chatBot: ChatBotPort, logger: LoggerPort, ai: AIPort, tools: AvailableAgentTools) =>
        new TechnologyEventsAgent({
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
        .provides(x)
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
