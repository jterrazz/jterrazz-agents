import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { formatChatBotMessages } from './formatters/chatbot-message-formatter.js';

const TOOL_NAME = 'fetchChatBotMessages';

const TOOL_DESCRIPTION = `
Get recent chatbot messages. No input required.
`.trim();

type FetchChatBotMessagesToolDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export function createFetchChatBotMessagesTool(
    dependencies: FetchChatBotMessagesToolDependencies,
): ToolPort {
    const { channelName, chatBot, logger } = dependencies;

    async function fetchChatBotMessages(): Promise<string> {
        logger.info('Executing fetchChatBotMessages tool...', { channelName });

        const messages = await chatBot.getRecentBotMessages(channelName);

        if (messages.length === 0) {
            logger.info('No bot messages found.', { channelName });
        } else {
            logger.info(`Found ${messages.length} bot messages.`, {
                channelName,
                count: messages.length,
            });
        }

        return formatChatBotMessages(messages);
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: fetchChatBotMessages,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
