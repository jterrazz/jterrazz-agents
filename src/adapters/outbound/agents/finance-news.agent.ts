import { type AgentTool } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { useFormat } from './prompts/use-format.js';
import { useLanguage } from './prompts/use-language.js';
import { useRole } from './prompts/use-role.js';
import { useTone } from './prompts/use-tone.js';

export class FinanceNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'An agent that posts about important news, discussions or updates related to financial markets and economy.',
            [
                useRole().contributor,
                useTone().fun,
                useFormat().discordNews,
                useLanguage().french,
            ],
            'FinanceNewsAgent'
        );
    }

    protected getTools(): AgentTool[] {
        return [
            this.tools.fetchChatBotMessages.finance,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForFinance,
        ];
    }
}
