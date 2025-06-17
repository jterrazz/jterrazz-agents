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
        logger.info(`Fetching recent bot messages from #${channelName}`, { channelName });

        const messages = await chatBot.getRecentBotMessages(channelName);

        logger.info('Retrieved bot messages', {
            channelName,
            messageCount: messages.length,
        });

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
