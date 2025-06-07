import { type AgentTool } from '../ports/outbound/agent.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';

export class FinanceNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies.ai,
            dependencies.channelName,
            dependencies.chatBot,
            dependencies.logger,
            dependencies.tools,
            'Only post about important news, discussions or updates related to financial markets and economy.',
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.finance,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForFinance,
        ];
    }
}
