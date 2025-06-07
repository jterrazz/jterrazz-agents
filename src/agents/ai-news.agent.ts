import { type DynamicTool } from 'langchain/tools';

import { type AgentDependencies, ChatAgent } from './base/chat-agent.js';

export class AINewsAgent extends ChatAgent {
    constructor(dependencies: AgentDependencies) {
        super(
            dependencies.ai,
            dependencies.channelName,
            dependencies.chatBot,
            dependencies.logger,
            dependencies.tools,
            'Only post about important news, discussions or updates related to AI topics.',
        );
    }

    protected getTools(): DynamicTool[] {
        return [
            this.tools.fetchChatBotMessages.ai,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForAI,
        ];
    }
}
