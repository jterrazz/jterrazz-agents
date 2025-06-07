import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat as agentFormat } from './prompts/agent-format.js';
import { useLanguage as agentLanguage } from './prompts/agent-language.js';
import { useRole as agentRole } from './prompts/agent-role.js';
import { useTone as agentTone } from './prompts/agent-tone.js';

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'TechnologyEventsAgent',
            'An agent that posts about upcoming events related to technology conferences and industry events.',
            [
                agentRole().contributor,
                agentTone().fun,
                agentFormat().discordEvents,
                agentLanguage().french,
            ],
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.technology,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForTechnology,
        ];
    }
}
