import { type AgentTool } from '../ports/outbound/agent.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'Only post about important news, discussions or updates related to technology conferences, product launches, and industry events.',
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
