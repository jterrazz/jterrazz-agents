import type { LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { withFetchDevTweetsTool } from './tools/fetch-dev-tweets.tool.js';

export type DevNewsAgentDependencies = {
    ai: AIPort;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AgentToolPort[];
};

export const createDevNewsAgent = ({ ai, chatBot, logger, tools }: DevNewsAgentDependencies) => {
    const agentSpecific = `
Only post about important news, discussions, or updates related to software development, open source, or the broader dev ecosystem.
`;
    return createChatAgent({
        ai,
        chatBot,
        logger,
        promptTemplate: [
            [
                'system',
                buildSystemPrompt(
                    agentSpecific,
                    withDiscordNewsMarkdownFormat(),
                    withFetchDevTweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools,
    });
};
