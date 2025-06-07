import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { buildSystemPrompt } from './prompts/system.js';
import { useFormat } from './prompts/use-format.js';
import { useLanguage } from './prompts/use-language.js';
import { useRole } from './prompts/use-role.js';
import { useTone } from './prompts/use-tone.js';

export class DevelopmentNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            buildSystemPrompt(
                useRole().contributor,
                'An agent that posts about important news, discussions or updates related to software development topics.',
                useTone().fun,
                useFormat().discordNews,
                useLanguage().french,
            ),
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
