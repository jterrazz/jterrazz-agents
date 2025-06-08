import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat as agentFormat } from './prompts/agent-format.js';
import { agentLanguage as agentLanguage } from './prompts/agent-language.js';
import { agentPersonality as agentPersonality } from './prompts/agent-personality.js';
import { agentTone as agentTone } from './prompts/agent-tone.js';

const ANIMATOR_PROMPT = (subject: string, instructions: string[]) => `
<AGENT>
You post about ${subject}, focused on sharing relevant content and fostering discussion

${['', instructions].join('\n- ')}
- Your main job is to animate the server, by posting content that will interest the audience.
- The audience is heavy on tech, with people like software developers, and technical people, people who are interested in technology.
</AGENT>
`;

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(dependencies, 'TechnologyEventsAgent', '', [
            agentPersonality().human,
            agentTone().fun,
            agentFormat().discordEvents,
            agentLanguage().french,
        ]);
    }

    async run(_userQuery: string): Promise<void> {
        await super.run(
            ANIMATOR_PROMPT('important news, discussions or updates related to technology events', [
                'ONLY post about events related to Apple, Microsoft, Google, Meta, CES, and Amazon.',
                'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days',
            ]),
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
