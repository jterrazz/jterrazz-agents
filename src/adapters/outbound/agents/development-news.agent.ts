import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat } from './prompts/agent-format.js';
import { useLanguage } from './prompts/agent-language.js';
import { useRole } from './prompts/agent-role.js';
import { useTone } from './prompts/agent-tone.js';

export class DevelopmentNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'DevelopmentNewsAgent',
            'You are a specialized agent that posts about important news, discussions or updates related to software development, programming languages, and development tools, based on the tools you\'re provided.',
            [useRole().contributor, useTone().fun, useFormat().discordNews, useLanguage().french],
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.development,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForDevelopment,
        ];
    }
}
