import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat } from './prompts/agent-format.js';
import { useLanguage } from './prompts/agent-language.js';
import { useRole } from './prompts/agent-role.js';
import { useTone } from './prompts/agent-tone.js';

export class AINewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'AINewsAgent',
            'An agent that posts about important news, discussions or updates related to AI topics.',
            [useRole().contributor, useTone().fun, useFormat().discordNews, useLanguage().french],
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.ai,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForAI,
        ];
    }
}
