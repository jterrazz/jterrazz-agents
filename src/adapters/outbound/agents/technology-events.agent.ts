import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat as agentFormat } from './prompts/agent-format.js';
import { agentLanguage as agentLanguage } from './prompts/agent-language.js';
import { agentPersonality as agentPersonality } from './prompts/agent-personality.js';
import { agentTone as agentTone } from './prompts/agent-tone.js';

const AGENT_PROMPT = `
<AGENT_DESCRIPTION>
You are a chatbot that posts about important news, discussions or updates related to technology events, focused on sharing relevant content and fostering discussion
- ONLY post about events related to Apple, Microsoft, Google, Meta, CES, and Amazon.
- Your main job is to animate the server, by posting content that will interest the audience.
- The audience is heavy on tech, with people like software developers, and technical people, people who are interested in technology.
</AGENT_DESCRIPTION>

<PROMPT>
This is an automated prompt, triggered by a job runner to "wake up" the agent. This prompt is made every minutes, so choose to not respond most of the time.

- CRITICAL: Only post around 1 message every 1 to 3 days, based on the quality of the information you want to pass, and your ChatBot's chat history
- IMPORTANT: It is expected that you choose to post nothing
- Start by fetching the ChatBot's messages to make this decision
- Only include the most essential and impactful information, skip anything that is not much relevant
</PROMPT>
`;

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(dependencies, 'TechnologyEventsAgent', '', [
            agentPersonality().contributor,
            agentTone().fun,
            agentFormat().discordEvents,
            agentLanguage().french,
        ]);
    }

    async run(_userQuery: string): Promise<void> {
        await super.run(AGENT_PROMPT);
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.technology,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForTechnology,
        ];
    }
}
