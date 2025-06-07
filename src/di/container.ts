import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type JobRunnerPort } from '../ports/inbound/job-runner.port.js';
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
const configurationAdapter = Injectable(
    'Configuration',
    (): ConfigurationPort => new NodeConfigAdapter(),
);

const logger = Injectable(
    'Logger',
    (): LoggerPort =>
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
    (config: ConfigurationPort, logger: LoggerPort): ChatBotPort =>
        new DiscordAdapter(config.getOutboundConfiguration().discordBotToken, logger),
);

const ai = Injectable(
    'AI',
    ['Configuration'] as const,
    (config: ConfigurationPort): AIPort =>
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
    ['ChatBot', 'X', 'Logger', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        x: XPort,
        logger: LoggerPort,
        config: ConfigurationPort,
    ): AvailableAgentTools => {
        const { discordChannels } = config.getOutboundConfiguration();
        return {
            fetchChatBotMessages: {
                ai: createFetchChatBotMessagesTool({
                    channelName: discordChannels.ai,
                    chatBot,
                    logger,
                }),
                crypto: createFetchChatBotMessagesTool({
                    channelName: discordChannels.crypto,
                    chatBot,
                    logger,
                }),
                development: createFetchChatBotMessagesTool({
                    channelName: discordChannels.development,
                    chatBot,
                    logger,
                }),
                finance: createFetchChatBotMessagesTool({
                    channelName: discordChannels.finance,
                    chatBot,
                    logger,
                }),
                space: createFetchChatBotMessagesTool({
                    channelName: discordChannels.space,
                    chatBot,
                    logger,
                }),
                technology: createFetchChatBotMessagesTool({
                    channelName: discordChannels.technology,
                    chatBot,
                    logger,
                }),
            },
            fetchEventsForSpace: createFetchEventsForSpaceTool(logger),
            fetchEventsForTechnology: createFetchEventsForTechnologyTool(logger),
            fetchPostsForAI: createFetchPostsForAITool(x, logger),
            fetchPostsForCrypto: createFetchPostsForCryptoTool(x, logger),
            fetchPostsForDevelopment: createFetchPostsForDevelopmentTool(x, logger),
            fetchPostsForFinance: createFetchPostsForFinanceTool(x, logger),
            getCurrentDate: createGetCurrentDateTool(logger),
        };
    },
);

/**
 * Agents
 */
const aiNewsAgent = Injectable(
    'AINewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new AINewsAgent({
            ai,
            channelName: config.getOutboundConfiguration().discordChannels.ai,
            chatBot,
            logger,
            tools,
        }),
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new CryptoNewsAgent({
            ai,
            channelName: config.getOutboundConfiguration().discordChannels.crypto,
            chatBot,
            logger,
            tools,
        }),
);

const developmentNewsAgent = Injectable(
    'DevelopmentNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new DevelopmentNewsAgent({
            ai,
            channelName: config.getOutboundConfiguration().discordChannels.development,
            chatBot,
            logger,
            tools,
        }),
);

const financeNewsAgent = Injectable(
    'FinanceNewsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new FinanceNewsAgent({
            ai,
            channelName: config.getOutboundConfiguration().discordChannels.finance,
            chatBot,
            logger,
            tools,
        }),
);

const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new SpaceEventsAgent({
            ai,
            channelName: config.getOutboundConfiguration().discordChannels.space,
            chatBot,
            logger,
            tools,
        }),
);

const technologyEventsAgent = Injectable(
    'TechnologyEventsAgent',
    ['ChatBot', 'Logger', 'AI', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        ai: AIPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new TechnologyEventsAgent({
            ai,
            channelName: config.getOutboundConfiguration().discordChannels.technology,
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
        'Configuration',
        'AINewsAgent',
        'CryptoNewsAgent',
        'DevelopmentNewsAgent',
        'FinanceNewsAgent',
        'SpaceEventsAgent',
        'TechnologyEventsAgent',
    ] as const,
    (
        logger: LoggerPort,
        config: ConfigurationPort,
        aiNewsAgent: AgentPort,
        cryptoNewsAgent: AgentPort,
        developmentNewsAgent: AgentPort,
        financeNewsAgent: AgentPort,
        spaceEventsAgent: AgentPort,
        technologyEventsAgent: AgentPort,
    ): JobRunnerPort => {
        const { jobs } = config.getInboundConfiguration();
        const enabledJobs = [];

        if (jobs.aiNews.enabled) {
            enabledJobs.push(createAINewsJob({ agent: aiNewsAgent }));
        }

        if (jobs.cryptoNews.enabled) {
            enabledJobs.push(createCryptoNewsJob({ agent: cryptoNewsAgent }));
        }

        if (jobs.developmentNews.enabled) {
            enabledJobs.push(createDevelopmentNewsJob({ agent: developmentNewsAgent }));
        }

        if (jobs.financeNews.enabled) {
            enabledJobs.push(createFinanceNewsJob({ agent: financeNewsAgent }));
        }

        if (jobs.spaceEvents.enabled) {
            enabledJobs.push(createSpaceEventsJob({ agent: spaceEventsAgent }));
        }

        if (jobs.technologyEvents.enabled) {
            enabledJobs.push(createTechnologyEventsJob({ agent: technologyEventsAgent }));
        }

        logger.info(`Enabled jobs: ${enabledJobs.map((job) => job.name).join(', ')}`);

        return new NodeCronAdapter(logger, enabledJobs);
    },
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
        .provides(technologyEventsAgent)
        .provides(aiNewsAgent)
        .provides(developmentNewsAgent)
        .provides(cryptoNewsAgent)
        .provides(financeNewsAgent)
        // JobRunner
        .provides(jobRunner);
