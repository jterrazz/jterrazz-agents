import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat as agentFormat } from './prompts/agent-format.js';
import { agentLanguage as agentLanguage } from './prompts/agent-language.js';
import { agentRole as agentRole } from './prompts/agent-role.js';
import { agentTone as agentTone } from './prompts/agent-tone.js';

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'TechnologyEventsAgent',
            'You are a specialized agent that posts about upcoming technology events. But only post about Apple, Microsoft, Google, Meta, CES, and Amazon.',
            [
                agentRole().contributor,
                agentTone().fun,
                agentFormat().discordEvents,
                agentLanguage().french,
            ],
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.technology,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForTechnology,
        ];
    }
}
