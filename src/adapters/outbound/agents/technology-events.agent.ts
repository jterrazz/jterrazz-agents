import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat as agentFormat } from './prompts/agent-format.js';
import { agentLanguage as agentLanguage } from './prompts/agent-language.js';
import { agentPersonality as agentPersonality } from './prompts/agent-personality.js';
import { agentTone as agentTone } from './prompts/agent-tone.js';
import { createAnimatorPrompt } from './prompts/animator.js';

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(dependencies, 'TechnologyEventsAgent', [
            agentPersonality().human,
            agentTone().fun,
            agentFormat().discordEvents,
            agentLanguage().french,
        ]);
    }

    async run(_userQuery: string): Promise<void> {
        await super.run(
            createAnimatorPrompt(
                'Important news, discussions or updates related to technology events',
                [
                    'ONLY post about events related to Apple, Microsoft, Google, Meta, CES, and Amazon.',
                    'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days',
                ],
            ),
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.technology,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForTechnology,
        ];
    }
}
