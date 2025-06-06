import { DynamicTool } from 'langchain/tools';

import type { ChatBotPort } from '../../ports/outbound/chatbot.port.js';

type GetChatBotMessagesToolDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
};

export const createGetChatBotMessagesTool = ({
    channelName,
    chatBot,
}: GetChatBotMessagesToolDependencies) =>
    new DynamicTool({
        description: `Get recent messages from the #${channelName} channel.`,
        func: async () => {
            const messages = await chatBot.getRecentBotMessages(channelName);
            return JSON.stringify(messages);
        },
        name: 'getChatBotMessages',
    });

export function withFetchRecentBotMessagesTool() {
    return 'Use the getRecentBotMessages tool to see what you (the bot) have recently posted.';
}
