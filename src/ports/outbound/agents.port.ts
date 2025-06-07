import { type DynamicTool } from 'langchain/tools';

export type AgentPort = {
    run(userQuery: string): Promise<void>;
};

export type AgentToolPort = DynamicTool<string>;

export type AvailableAgentTools = {
    fetchChatBotMessages: {
        ai: AgentToolPort;
        crypto: AgentToolPort;
        development: AgentToolPort;
        finance: AgentToolPort;
        space: AgentToolPort;
        technology: AgentToolPort;
    };
    fetchEventsForSpace: AgentToolPort;
    fetchEventsForTechnology: AgentToolPort;
    fetchPostsForAI: AgentToolPort;
    fetchPostsForCrypto: AgentToolPort;
    fetchPostsForDevelopment: AgentToolPort;
    fetchPostsForFinance: AgentToolPort;
    getCurrentDate: AgentToolPort;
};
