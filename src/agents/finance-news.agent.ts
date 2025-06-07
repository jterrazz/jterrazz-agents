import { type DynamicTool } from 'langchain/tools';

import { type AgentDependencies, ChatAgent } from './base/chat-agent.js';

export class FinanceNewsAgent extends ChatAgent {
    constructor(dependencies: AgentDependencies) {
        super(
            dependencies.ai,
            dependencies.channelName,
            dependencies.chatBot,
            dependencies.logger,
            dependencies.tools,
            'Only post about important news, discussions or updates related to financial markets and economy.',
        );
    }

    protected getTools(): DynamicTool[] {
        return [
            this.tools.fetchChatBotMessages.finance,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForFinance,
        ];
    }
}
