import type { LoggerPort } from '@jterrazz/logger';

import { type AvailableTools } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';

export type AINewsAgentDependencies = {
    ai: AIPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AvailableTools;
};

export const createAINewsAgent = ({
    ai,
    channelName,
    chatBot,
    logger,
    tools,
}: AINewsAgentDependencies) => {
    const agentSpecific = `
Only post about important news, discussions or updates related to AI topics.
`;

    return createChatAgent({
        ai,
        channelName,
        chatBot,
        logger,
        promptTemplate: [
            ['system', buildSystemPrompt(agentSpecific, withDiscordNewsMarkdownFormat())],
            ['human', '{input}'],
        ],
        tools: [tools.fetchRecentBotMessages.ai, tools.fetchAITweets, tools.getCurrentDate],
    });
};
