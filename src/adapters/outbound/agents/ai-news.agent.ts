import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat } from './prompts/agent-format.js';
import { agentLanguage } from './prompts/agent-language.js';
import { agentPersonality } from './prompts/agent-personality.js';
import { agentTone } from './prompts/agent-tone.js';

export class AINewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'AINewsAgent',
            'You are a specialized agent that posts about important news, discussions or updates related to artificial intelligence, based on the tools you\'re provided.',
            [agentPersonality().contributor, agentTone().fun, agentFormat().discordNews, agentLanguage().french],
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.ai,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForAI,
        ];
    }
}
