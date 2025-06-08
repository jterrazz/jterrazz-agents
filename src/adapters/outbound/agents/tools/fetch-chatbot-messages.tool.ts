import { type LoggerPort } from '@jterrazz/logger';
import { DynamicTool } from 'langchain/tools';

import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { formatChatBotMessages } from './formatters/chatbot-message-formatter.js';

type FetchChatBotMessagesToolDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export function createFetchChatBotMessagesTool({
    channelName,
    chatBot,
    logger,
}: FetchChatBotMessagesToolDependencies) {
    return new DynamicTool({
        description: `Get recent chatbot messages. No input required.`,
        func: async () => {
            logger.info(`Fetching recent bot messages from #${channelName}`, { channelName });

            const messages = await chatBot.getRecentBotMessages(channelName);

            logger.info('Retrieved bot messages', {
                channelName,
                messageCount: messages.length,
            });

            console.log(formatChatBotMessages(messages));
            return formatChatBotMessages(messages);
        },
        name: 'fetchChatBotMessages',
    });
}
