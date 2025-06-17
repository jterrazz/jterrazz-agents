import { type ToolPort } from '@jterrazz/intelligence';

export type AvailableAgentTools = {
    fetchChatBotMessages: {
        ai: ToolPort;
        crypto: ToolPort;
        development: ToolPort;
        finance: ToolPort;
        space: ToolPort;
        technology: ToolPort;
    };
    fetchEventsForSpace: ToolPort;
    fetchEventsForTechnology: ToolPort;
    fetchPostsForAI: ToolPort;
    fetchPostsForCrypto: ToolPort;
    fetchPostsForDevelopment: ToolPort;
    fetchPostsForFinance: ToolPort;
    getCurrentDate: ToolPort;
};
