import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';

export class SpaceEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'Only post about important news, discussions or updates related to space exploration, astronomy, and space technology.',
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.space,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForSpace,
        ];
    }
}
