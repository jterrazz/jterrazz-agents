import { type LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { formatChatBotMessages } from './formatters/chatbot-message-formatter.js';

import { createSafeAgentTool } from './tool.js';

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
    return createSafeAgentTool(
        {
            description: `Get recent chatbot messages. No input required.`,
            name: 'fetchChatBotMessages',
        },
        async () => {
            logger.info(`Fetching recent bot messages from #${channelName}`, { channelName });

            const messages = await chatBot.getRecentBotMessages(channelName);

            logger.info('Retrieved bot messages', {
                channelName,
                messageCount: messages.length,
            });

            return formatChatBotMessages(messages);
        },
        logger,
    );
}
