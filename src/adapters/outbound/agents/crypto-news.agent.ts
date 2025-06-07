import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat } from './prompts/agent-format.js';
import { useLanguage } from './prompts/agent-language.js';
import { useRole } from './prompts/agent-role.js';
import { useTone } from './prompts/agent-tone.js';

export class CryptoNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'CryptoNewsAgent',
            'You are a specialized agent that posts about important news, discussions or updates related to cryptocurrency, blockchain technology, and digital assets, based on the tools you\'re provided.',
            [useRole().contributor, useTone().fun, useFormat().discordNews, useLanguage().french],
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
