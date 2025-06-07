import { type AgentTool } from '../../../ports/outbound/agent.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';

export class CryptoNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'Only post about important news, discussions or updates related to crypto topics.',
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.crypto,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForCrypto,
        ];
    }
}
