import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat } from './prompts/agent-format.js';
import { agentLanguage } from './prompts/agent-language.js';
import { agentPersonality } from './prompts/agent-personality.js';
import { agentTone } from './prompts/agent-tone.js';
import { createAnimatorPrompt } from './prompts/animator.js';

export class AINewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(dependencies, 'AINewsAgent', [
            agentPersonality.human,
            agentTone.fun,
            agentFormat.discordNews,
            agentLanguage.french,
        ]);
    }

    async run(_userQuery: string): Promise<void> {
        await super.run(
            createAnimatorPrompt(
                'Important news, discussions or updates related to artificial intelligence.',
                ['CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days'],
            ),
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.ai,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForAI,
        ];
    }
}
