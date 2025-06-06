import type { LoggerPort } from '@jterrazz/logger';

import { type AgentToolPort } from '../ports/outbound/agent.port.js';
import { type AIPort } from '../ports/outbound/ai.port.js';
import { type ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { useDiscordEventsMarkdownFormat } from './templates/discord-space-events-markdown.template.js';
import { buildSystemPrompt } from './templates/system.js';
import { withFetchSpaceEventsTool } from './tools/fetch-space-events.tool.js';

export type SpaceEventsAgentDependencies = {
    ai: AIPort;
    chatBot: ChatBotPort;
    logger: LoggerPort;
    tools: AgentToolPort[];
};

export function createSpaceEventsAgent({
    ai,
    chatBot,
    logger,
    tools,
}: SpaceEventsAgentDependencies) {
    const agentSpecific = `
Only update about Starship launches. And events categorized as "space mission". Ignore other events.
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
                    useDiscordEventsMarkdownFormat(),
                    withFetchSpaceEventsTool(),
                ),
            ],
            ['human', '{input}'],
        ],
        tools,
    });
}
