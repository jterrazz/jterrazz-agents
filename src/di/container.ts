import { Container, Injectable } from '@snap/ts-inject';

import type { ConfigurationPort } from '../ports/inbound/configuration.port.js';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { NodeConfigAdapter } from '../adapters/inbound/node-config.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot/discord.adapter.js';
import { searchWeb } from '../adapters/outbound/search/tavily.adapter.js';
import { getUpcomingEvents } from '../adapters/outbound/web/nextspaceflight-web.adapter.js';

import { createEventsAgent } from '../agents/events-agent.js';

/**
 * Outbound adapters
 */
const configurationAdapter = Injectable('Configuration', () => new NodeConfigAdapter());

const chatBotPort = Injectable(
    'ChatBotPort',
    ['Configuration'] as const,
    (config: ConfigurationPort) =>
        new DiscordAdapter(config.getOutboundConfiguration().discordBotToken),
);

const spaceEventsAdapter = Injectable('SpaceEventsAdapter', () => getUpcomingEvents);
const webSearchAdapter = Injectable('WebSearchAdapter', () => searchWeb);

/**
 * Agent factories
 */
const eventsAgentFactory = Injectable(
    'EventsAgent',
    ['ChatBotPort'] as const,
    (chatBot: ChatBotPort) =>
        createEventsAgent({
            channelName: 'space',
            chatBot,
        }),
);

/**
 * Container configuration
 */
export const createContainer = () =>
    Container
        // Outbound adapters
        .provides(configurationAdapter)
        .provides(spaceEventsAdapter)
        .provides(webSearchAdapter)
        .provides(chatBotPort)
        // Agents
        .provides(eventsAgentFactory);
