import type { DynamicTool } from '@langchain/core/tools';

export type AgentPort = {
    run(userQuery: string): Promise<void>;
};

export type AgentToolPort = DynamicTool<string>;

export type AvailableTools = {
    fetchAITweets: AgentToolPort;
    fetchCryptoTweets: AgentToolPort;
    fetchDevelopmentTweets: AgentToolPort;
    fetchFinancialTweets: AgentToolPort;
    fetchTechnologyEvents: AgentToolPort;
    getChatBotMessages: {
        ai: AgentToolPort;
        crypto: AgentToolPort;
        development: AgentToolPort;
        finance: AgentToolPort;
        space: AgentToolPort;
        technology: AgentToolPort;
    };
    getCurrentDate: AgentToolPort;
};
