import { type DynamicTool } from 'langchain/tools';

export type AgentPort = {
    run(userQuery: string): Promise<void>;
};

export type AvailableTools = {
    fetchChatBotMessages: {
        ai: DynamicTool;
        crypto: DynamicTool;
        development: DynamicTool;
        finance: DynamicTool;
        space: DynamicTool;
        technology: DynamicTool;
    };
    fetchPostsForAI: DynamicTool;
    fetchPostsForCrypto: DynamicTool;
    fetchPostsForDevelopment: DynamicTool;
    fetchPostsForFinance: DynamicTool;
    fetchTechnologyEvents: DynamicTool;
    getCurrentDate: DynamicTool;
};
