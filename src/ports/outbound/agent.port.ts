import { type DynamicTool } from 'langchain/tools';

export type AgentPort = {
    run(userQuery: string): Promise<void>;
};

export type AgentTool = DynamicTool<string>;

export type AvailableAgentTools = {
    fetchChatBotMessages: {
        ai: AgentTool;
        crypto: AgentTool;
        development: AgentTool;
        finance: AgentTool;
        space: AgentTool;
        technology: AgentTool;
    };
    fetchEventsForSpace: AgentTool;
    fetchEventsForTechnology: AgentTool;
    fetchPostsForAI: AgentTool;
    fetchPostsForCrypto: AgentTool;
    fetchPostsForDevelopment: AgentTool;
    fetchPostsForFinance: AgentTool;
    getCurrentDate: AgentTool;
};
