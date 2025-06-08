import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat } from './prompts/agent-format.js';
import { agentLanguage } from './prompts/agent-language.js';
import { agentPersonality } from './prompts/agent-personality.js';
import { agentTone } from './prompts/agent-tone.js';
import { createAnimatorPrompt } from './prompts/animator.js';

export class CryptoNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(dependencies, 'CryptoNewsAgent', [
            agentPersonality().human,
            agentTone().fun,
            agentFormat().discordNews,
            agentLanguage().french,
        ]);
    }

    async run(_userQuery: string): Promise<void> {
        await super.run(
            createAnimatorPrompt(
                'Important news, discussions or updates related to cryptocurrency, blockchain technology, and digital assets.',
                ['CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days'],
            ),
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.crypto,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForCrypto,
        ];
    }
}
