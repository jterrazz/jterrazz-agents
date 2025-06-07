import { DynamicTool } from 'langchain/tools';

import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { formatDate } from './utils/date-formatter.js';

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
            return messages
                .map(
                    (message) =>
                        `Date: ${formatDate(message.date)} (${message.timeAgo})\n` +
                        `Content: ${message.content}\n`,
                )
                .join('\n');
        },
        name: 'fetchChatBotMessages',
    });

export function withFetchRecentBotMessagesTool() {
    return 'Use the fetchRecentBotMessages tool to see what you (the bot) have recently posted.';
}
