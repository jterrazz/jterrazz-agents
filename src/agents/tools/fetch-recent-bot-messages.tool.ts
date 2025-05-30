import { tool } from '@langchain/core/tools';

import type { ChatBotPort } from '../../ports/outbound/chatbot.port.js';

export function createFetchRecentBotMessagesTool({
    channelName,
    chatBot,
}: {
    channelName: string;
    chatBot: ChatBotPort;
}) {
    return tool(
        async (_input: string) => {
            return JSON.stringify(await chatBot.getRecentBotMessages(channelName, 20));
        },
        {
            description: `Fetches the most recent messages sent by the bot in the ${channelName} channel.`,
            name: 'getRecentBotMessages',
        },
    );
}
