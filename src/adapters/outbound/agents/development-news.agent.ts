import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat } from './prompts/use-format.js';
import { useLanguage } from './prompts/use-language.js';
import { useRole } from './prompts/use-role.js';
import { useTone } from './prompts/use-tone.js';

export class DevelopmentNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'An agent that posts about important news, discussions or updates related to software development topics.',
            [useRole().contributor, useTone().fun, useFormat().discordNews, useLanguage().french],
            'DevelopmentNewsAgent',
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.development,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForDevelopment,
        ];
    }
}
