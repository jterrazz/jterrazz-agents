import { type DynamicTool } from 'langchain/tools';

import { type AgentDependencies, ChatAgent } from './base/chat-agent.js';

export class TechnologyEventsAgent extends ChatAgent {
    constructor(dependencies: AgentDependencies) {
        super(
            dependencies.ai,
            dependencies.channelName,
            dependencies.chatBot,
            dependencies.logger,
            dependencies.tools,
            'Only post about important news, discussions or updates related to technology conferences, product launches, and industry events.',
        );
    }

    protected getTools(): DynamicTool[] {
        return [
            this.tools.fetchChatBotMessages.technology,
            this.tools.getCurrentDate,
            this.tools.fetchEventsForTechnology,
        ];
    }
}
