import { DynamicTool } from 'langchain/tools';

import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { formatDate } from './formatters/date-formatter.js';
import { formatTimeAgo } from './formatters/time-ago-formatter.js';

type FetchChatBotMessagesToolDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
};

export function createFetchChatBotMessagesTool({
    channelName,
    chatBot,
}: FetchChatBotMessagesToolDependencies) {
    return new DynamicTool({
        description: `Get recent messages from the #${channelName} channel.`,
        func: async () => {
            const messages = await chatBot.getRecentBotMessages(channelName);
            return messages
                .map(
                    (message) =>
                        `Date: ${formatDate(message.date)} (${formatTimeAgo(message.date)})\n` +
                        `Content: ${message.content}\n`,
                )
                .join('\n');
        },
        name: 'fetchChatBotMessages',
    });
}
