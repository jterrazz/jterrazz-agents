import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat } from './prompts/agent-format.js';
import { agentLanguage } from './prompts/agent-language.js';
import { agentRole } from './prompts/agent-role.js';
import { agentTone } from './prompts/agent-tone.js';

export class SpaceEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'SpaceEventsAgent',
            "You are a specialized agent that posts about upcoming events related to space exploration, space missions, and aerospace technology, based on the tools you're provided. But only post about Starship.",
            [agentRole().contributor, agentTone().fun, agentFormat().discordEvents, agentLanguage().french],
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.space,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForSpace,
        ];
    }
}
