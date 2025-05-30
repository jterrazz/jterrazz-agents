import { Container, Injectable } from '@snap/ts-inject';

import { DiscordAdapter } from '../adapters/chatbot.adapter.js';
import { getUpcomingEvents } from '../adapters/nextspaceflight-events.service.js';
import { searchWeb } from '../adapters/websearch.service.js';

import { createEventsAgent } from '../agents/events-agent.js';
import {
    fetchRecentBotMessagesTool,
    fetchSpaceEventsTool,
    webSearchTool,
} from '../agents/tools.js';
import { token } from '../index.js';

// Outbound adapters (concrete implementations)
const spaceEventsAdapter = Injectable('SpaceEventsAdapter', () => getUpcomingEvents);

const webSearchAdapter = Injectable('WebSearchAdapter', () => searchWeb);

const getDiscordToken = (): string => {
    if (!token) {
        throw new Error("La variable d'environnement DISCORD_BOT_TOKEN est requise.");
    }
    return token;
};

const discordAdapter = Injectable('DiscordAdapter', () => new DiscordAdapter(getDiscordToken()));
const chatBotPort = Injectable('ChatBotPort', () => new DiscordAdapter(getDiscordToken()));

// Tools (as injectable singletons)
const fetchSpaceEventsToolProvider = Injectable('FetchSpaceEventsTool', () => fetchSpaceEventsTool);

const webSearchToolProvider = Injectable('WebSearchTool', () => webSearchTool);

const fetchRecentBotMessagesToolProvider = Injectable(
    'FetchRecentBotMessagesTool',
    () => fetchRecentBotMessagesTool,
);

const eventsAgentFactory = Injectable('EventsAgent', () =>
    createEventsAgent({
        fetchRecentBotMessagesTool,
        fetchSpaceEventsTool,
        webSearchTool,
    }),
);

export const createContainer = () =>
    Container.provides(spaceEventsAdapter)
        .provides(webSearchAdapter)
        .provides(discordAdapter)
        .provides(chatBotPort)
        .provides(fetchSpaceEventsToolProvider)
        .provides(webSearchToolProvider)
        .provides(fetchRecentBotMessagesToolProvider)
        .provides(eventsAgentFactory);
