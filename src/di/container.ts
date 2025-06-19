import { type AgentPort, type ModelPort, OpenRouterAdapter } from '@jterrazz/intelligence';
import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type JobRunnerPort } from '../ports/inbound/job-runner.port.js';
import { type AvailableAgentTools } from '../ports/outbound/agents.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';
import { type XPort } from '../ports/outbound/providers/x.port.js';

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
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';
import { createXAdapter } from '../adapters/outbound/providers/x.adapter.js';

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

const model = Injectable(
    'Model',
    ['Configuration'] as const,
    (config: ConfigurationPort): ModelPort =>
        new OpenRouterAdapter({
            apiKey: config.getOutboundConfiguration().openrouterApiKey,
            metadata: {
                application: 'jterrazz-agents',
                website: 'https://jterrazz.com',
            },
            modelName: 'google/gemini-2.5-flash',
        }),
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
    ['ChatBot', 'Logger', 'Model', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new AINewsAgent(
            model,
            tools,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.ai,
        ),
);

const cryptoNewsAgent = Injectable(
    'CryptoNewsAgent',
    ['ChatBot', 'Logger', 'Model', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new CryptoNewsAgent(
            model,
            tools,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.crypto,
        ),
);

const developmentNewsAgent = Injectable(
    'DevelopmentNewsAgent',
    ['ChatBot', 'Logger', 'Model', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new DevelopmentNewsAgent(
            model,
            tools,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.development,
        ),
);

const financeNewsAgent = Injectable(
    'FinanceNewsAgent',
    ['ChatBot', 'Logger', 'Model', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new FinanceNewsAgent(
            model,
            tools,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.finance,
        ),
);

const spaceEventsAgent = Injectable(
    'SpaceEventsAgent',
    ['ChatBot', 'Logger', 'Model', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new SpaceEventsAgent(
            model,
            tools,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.space,
        ),
);

const technologyEventsAgent = Injectable(
    'TechnologyEventsAgent',
    ['ChatBot', 'Logger', 'Model', 'Tools', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        tools: AvailableAgentTools,
        config: ConfigurationPort,
    ): AgentPort =>
        new TechnologyEventsAgent(
            model,
            tools,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.technology,
        ),
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
            enabledJobs.push(
                createAINewsJob({
                    agent: aiNewsAgent,
                    executeOnStartup: jobs.aiNews.executeOnStartup,
                }),
            );
        }

        if (jobs.cryptoNews.enabled) {
            enabledJobs.push(
                createCryptoNewsJob({
                    agent: cryptoNewsAgent,
                    executeOnStartup: jobs.cryptoNews.executeOnStartup,
                }),
            );
        }

        if (jobs.developmentNews.enabled) {
            enabledJobs.push(
                createDevelopmentNewsJob({
                    agent: developmentNewsAgent,
                    executeOnStartup: jobs.developmentNews.executeOnStartup,
                }),
            );
        }

        if (jobs.financeNews.enabled) {
            enabledJobs.push(
                createFinanceNewsJob({
                    agent: financeNewsAgent,
                    executeOnStartup: jobs.financeNews.executeOnStartup,
                }),
            );
        }

        if (jobs.spaceEvents.enabled) {
            enabledJobs.push(
                createSpaceEventsJob({
                    agent: spaceEventsAgent,
                    executeOnStartup: jobs.spaceEvents.executeOnStartup,
                }),
            );
        }

        if (jobs.technologyEvents.enabled) {
            enabledJobs.push(
                createTechnologyEventsJob({
                    agent: technologyEventsAgent,
                    executeOnStartup: jobs.technologyEvents.executeOnStartup,
                }),
            );
        }

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
        .provides(model)
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
