import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat } from './prompts/agent-format.js';
import { agentLanguage } from './prompts/agent-language.js';
import { agentPersonality } from './prompts/agent-personality.js';
import { agentTone } from './prompts/agent-tone.js';
import { createAnimatorPrompt } from './prompts/animator.js';

export class SpaceEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(dependencies, 'SpaceEventsAgent', [
            agentPersonality().human,
            agentTone().fun,
            agentFormat().discordEvents,
            agentLanguage().french,
        ]);
    }

    async run(_userQuery: string): Promise<void> {
        await super.run(
            createAnimatorPrompt(
                'Upcoming events related to space exploration, space missions, and aerospace technology.',
                [
                    'IMPORTANT: for "rocket-launch" events, only post about Starship. For "space-mission" events, post about all events.',
                    'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days',
                ],
            ),
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.space,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForSpace,
        ];
    }
}
