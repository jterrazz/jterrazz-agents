import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';

export class AINewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'Only post about important news, discussions or updates related to AI topics.',
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
