import type { LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { withDiscordNewsMarkdownFormat } from './templates/discord-news-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { withFetchAITweetsTool } from './tools/fetch-ai-tweets.tool.js';

export type AINewsAgentDependencies = {
    ai: AIPort;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AgentToolPort[];
};

export const createAINewsAgent = ({
    ai,
    chatBot,
    logger,
    tools,
}: AINewsAgentDependencies) => {
    const agentSpecific = `
Only post about important news, discussions, or updates related to AI, machine learning, or the broader tech/AI ecosystem.
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
                    withFetchAITweetsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools,
    });
}
