import { type AgentToolPort } from '../../../ports/outbound/agents.port.js';

import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';
import { agentFormat } from './prompts/agent-format.js';
import { agentLanguage } from './prompts/agent-language.js';
import { agentRole } from './prompts/agent-role.js';
import { agentTone } from './prompts/agent-tone.js';

export class FinanceNewsAgent extends ChatAgent {
    constructor(dependencies: ChatAgentDependencies) {
        super(
            dependencies,
            'FinanceNewsAgent',
            "You are a specialized agent that posts about important news, discussions or updates related to financial markets and economy, based on the tools you're provided.",
            [agentRole().contributor, agentTone().fun, agentFormat().discordNews, agentLanguage().french],
        );
    }

    protected getTools(): AgentToolPort[] {
        return [
            this.tools.fetchChatBotMessages.finance,
            this.tools.getCurrentDate,
            this.tools.fetchPostsForFinance,
        ];
    }
}
