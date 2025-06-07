import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { buildSystemPrompt } from './prompts/system.js';
import { useFormat } from './prompts/use-format.js';
import { useLanguage } from './prompts/use-language.js';
import { useRole } from './prompts/use-role.js';
import { useTone } from './prompts/use-tone.js';

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            buildSystemPrompt(
                useRole().contributor,
                'An agent that posts about upcoming events related to technology conferences and industry events.',
                useTone().fun,
                useFormat().discordEvents,
                useLanguage().french,
            ),
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.technology,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForTechnology,
        ];
    }
}
