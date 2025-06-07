import { DynamicTool } from 'langchain/tools';

import type { ChatBotPort } from '../../ports/outbound/chatbot.port.js';

type FetchChatBotMessagesToolDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
};

export const createFetchChatBotMessagesTool = ({
    channelName,
    chatBot,
}: FetchChatBotMessagesToolDependencies) =>
    new DynamicTool({
        description: `Get recent messages from the #${channelName} channel.`,
        func: async () => {
            const messages = await chatBot.getRecentBotMessages(channelName);
            return JSON.stringify(messages);
        },
        name: 'fetchChatBotMessages',
    });

export function withFetchRecentBotMessagesTool() {
    return 'Use the fetchRecentBotMessages tool to see what you (the bot) have recently posted.';
}
