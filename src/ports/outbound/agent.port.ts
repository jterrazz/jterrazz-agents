import { type DynamicTool } from 'langchain/tools';


export type AgentPort = {
    run(userQuery: string): Promise<void>;
};

export type AvailableTools = {
    fetchAITweets: DynamicTool;
    fetchChatBotMessages: {
        ai: DynamicTool;
        crypto: DynamicTool;
        development: DynamicTool;
        finance: DynamicTool;
        space: DynamicTool;
        technology: DynamicTool;
    };
    fetchCryptoTweets: DynamicTool;
    fetchDevelopmentTweets: DynamicTool;
    fetchFinancialTweets: DynamicTool;
    fetchTechnologyEvents: DynamicTool;
    getCurrentDate: DynamicTool;
};
