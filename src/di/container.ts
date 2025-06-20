import { type AgentPort, type ModelPort, OpenRouterAdapter } from '@jterrazz/intelligence';
import { type LoggerPort, PinoLoggerAdapter } from '@jterrazz/logger';
import { Container, Injectable } from '@snap/ts-inject';

import { NodeConfigAdapter } from '../adapters/inbound/configuration/node-config.adapter.js';
import { type ConfigurationPort } from '../ports/inbound/configuration.port.js';

import { type ExecutorPort } from '../ports/inbound/executor.port.js';
import { type AvailableAgentTools } from '../ports/outbound/agents.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';
import { type XPort } from '../ports/outbound/providers/x.port.js';

import { createSpaceEventsTask } from '../adapters/inbound/executor/events/space-events.task.js';
import { createTechnologyEventsTask } from '../adapters/inbound/executor/events/technology-events.task.js';
import { createAINewsTask } from '../adapters/inbound/executor/news/ai-news.task.js';
import { createCryptoNewsTask } from '../adapters/inbound/executor/news/crypto-news.task.js';
import { createDevelopmentNewsTask } from '../adapters/inbound/executor/news/development-news.task.js';
import { createFinanceNewsTask } from '../adapters/inbound/executor/news/finance-news.task.js';
import { NodeCronAdapter } from '../adapters/inbound/executor/node-cron.adapter.js';
import { createArchitectureTipsTask } from '../adapters/inbound/executor/tips/architecture-tips.task.js';
import { AINewsAgent } from '../adapters/outbound/agents/ai-news.agent.js';
import { ArchitectureTipsAgent } from '../adapters/outbound/agents/architecture-tips.agent.js';
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

const architectureTipsAgent = Injectable(
    'ArchitectureTipsAgent',
    ['ChatBot', 'Logger', 'Model', 'Configuration'] as const,
    (
        chatBot: ChatBotPort,
        logger: LoggerPort,
        model: ModelPort,
        config: ConfigurationPort,
    ): AgentPort =>
        new ArchitectureTipsAgent(
            model,
            logger,
            chatBot,
            config.getOutboundConfiguration().discordChannels.architecture,
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
 * Executor
 */
const executor = Injectable(
    'Executor',
    [
        'Logger',
        'Configuration',
        'AINewsAgent',
        'ArchitectureTipsAgent',
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
        architectureTipsAgent: AgentPort,
        cryptoNewsAgent: AgentPort,
        developmentNewsAgent: AgentPort,
        financeNewsAgent: AgentPort,
        spaceEventsAgent: AgentPort,
        technologyEventsAgent: AgentPort,
    ): ExecutorPort => {
        const { tasks } = config.getInboundConfiguration();
        const enabledTasks = [];

        if (tasks.aiNews.enabled) {
            enabledTasks.push(
                createAINewsTask({
                    agent: aiNewsAgent,
                    executeOnStartup: tasks.aiNews.executeOnStartup,
                }),
            );
        }

        if (tasks.architectureTips.enabled) {
            enabledTasks.push(
                createArchitectureTipsTask({
                    agent: architectureTipsAgent,
                    executeOnStartup: tasks.architectureTips.executeOnStartup,
                }),
            );
        }
        if (tasks.cryptoNews.enabled) {
            enabledTasks.push(
                createCryptoNewsTask({
                    agent: cryptoNewsAgent,
                    executeOnStartup: tasks.cryptoNews.executeOnStartup,
                }),
            );
        }

        if (tasks.developmentNews.enabled) {
            enabledTasks.push(
                createDevelopmentNewsTask({
                    agent: developmentNewsAgent,
                    executeOnStartup: tasks.developmentNews.executeOnStartup,
                }),
            );
        }

        if (tasks.financeNews.enabled) {
            enabledTasks.push(
                createFinanceNewsTask({
                    agent: financeNewsAgent,
                    executeOnStartup: tasks.financeNews.executeOnStartup,
                }),
            );
        }

        if (tasks.spaceEvents.enabled) {
            enabledTasks.push(
                createSpaceEventsTask({
                    agent: spaceEventsAgent,
                    executeOnStartup: tasks.spaceEvents.executeOnStartup,
                }),
            );
        }

        if (tasks.technologyEvents.enabled) {
            enabledTasks.push(
                createTechnologyEventsTask({
                    agent: technologyEventsAgent,
                    executeOnStartup: tasks.technologyEvents.executeOnStartup,
                }),
            );
        }

        return new NodeCronAdapter(logger, enabledTasks);
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
        .provides(architectureTipsAgent)
        .provides(spaceEventsAgent)
        .provides(technologyEventsAgent)
        .provides(aiNewsAgent)
        .provides(developmentNewsAgent)
        .provides(cryptoNewsAgent)
        .provides(financeNewsAgent)
        // Executor
        .provides(executor);
