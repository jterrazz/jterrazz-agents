import { type DynamicTool } from 'langchain/tools';

import { type AgentDependencies, ChatAgent } from './base/chat-agent.js';

export class CryptoNewsAgent extends ChatAgent {
    constructor(dependencies: AgentDependencies) {
        super(
            dependencies.ai,
            dependencies.channelName,
            dependencies.chatBot,
            dependencies.logger,
            dependencies.tools,
            'Only post about important news, discussions or updates related to crypto topics.',
        );
    }

    protected getTools(): DynamicTool[] {
        return [
            this.tools.fetchChatBotMessages.crypto,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForCrypto,
        ];
    }
}
