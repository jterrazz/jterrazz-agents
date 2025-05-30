import { Container, Injectable } from '@snap/ts-inject';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { NodeConfigAdapter } from '../adapters/inbound/node-config.adapter.js';
import { DiscordAdapter } from '../adapters/outbound/chatbot.adapter.js';
import { getUpcomingEvents } from '../adapters/outbound/nextspaceflight-events.service.js';
import { searchWeb } from '../adapters/outbound/websearch.service.js';

import { createEventsAgent } from '../agents/events-agent.js';
import { createFetchSpaceEventsTool, createWebSearchTool } from '../agents/tools.js';
import { token } from '../index.js';

// Outbound adapters (concrete implementations)
const spaceEventsAdapter = Injectable('SpaceEventsAdapter', () => getUpcomingEvents);

const webSearchAdapter = Injectable('WebSearchAdapter', () => searchWeb);

const configurationAdapter = Injectable('Configuration', () => new NodeConfigAdapter());

const getDiscordToken = (): string => {
    if (!token) {
        throw new Error("La variable d'environnement DISCORD_BOT_TOKEN est requise.");
    }
    return token;
};

const discordAdapter = Injectable('DiscordAdapter', () => new DiscordAdapter(getDiscordToken()));
const chatBotPort = Injectable('ChatBotPort', () => new DiscordAdapter(getDiscordToken()));

const fetchSpaceEventsToolProvider = Injectable('FetchSpaceEventsTool', () =>
    createFetchSpaceEventsTool(),
);
const webSearchToolProvider = Injectable('WebSearchTool', () => createWebSearchTool());

const eventsAgentFactory = Injectable(
    'EventsAgent',
    ['ChatBotPort'] as const,
    (chatBot: ChatBotPort) =>
        createEventsAgent({
            channelName: 'space',
            chatBot,
        }),
);

export const createContainer = () =>
    Container.provides(configurationAdapter)
        .provides(spaceEventsAdapter)
        .provides(webSearchAdapter)
        .provides(discordAdapter)
        .provides(chatBotPort)
        .provides(fetchSpaceEventsToolProvider)
        .provides(webSearchToolProvider)
        .provides(eventsAgentFactory);
