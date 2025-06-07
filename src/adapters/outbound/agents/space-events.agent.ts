import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat } from './prompts/agent-format.js';
import { useLanguage } from './prompts/agent-language.js';
import { useRole } from './prompts/agent-role.js';
import { useTone } from './prompts/agent-tone.js';

export class SpaceEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'SpaceEventsAgent',
            'An agent that posts about upcoming events related to space exploration and space technology.',
            [useRole().contributor, useTone().fun, useFormat().discordEvents, useLanguage().french],
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.space,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForSpace,
        ];
    }
}
