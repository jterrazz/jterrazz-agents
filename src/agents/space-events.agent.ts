import type { LoggerPort } from '@jterrazz/logger';

import { type AvailableTools } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordEventsMarkdownFormat } from './templates/discord-space-events-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';

export type SpaceEventsAgentDependencies = {
    ai: AIPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AvailableTools;
};

export const createSpaceEventsAgent = ({
    ai,
    channelName,
    chatBot,
    logger,
    tools,
}: SpaceEventsAgentDependencies) => {
    const agentSpecific = `
Only post about important news, discussions or updates related to space topics.
`;
    return createChatAgent({
        ai,
        channelName,
        chatBot,
        logger,
        promptTemplate: [
            ['system', buildSystemPrompt(agentSpecific, useDiscordEventsMarkdownFormat())],
            ['human', '{input}'],
        ],
        tools: [tools.getCurrentDate, tools.fetchRecentBotMessages.space],
    });
};
