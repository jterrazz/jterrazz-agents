import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createCryptoAgent } from '../../../../agents/crypto-agent.js';

export type CryptoTwitterJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createCryptoTwitterJob = ({
    channelName,
    chatBot,
    logger,
}: CryptoTwitterJobDependencies): Job => ({
    execute: async () => {
        const agent = createCryptoAgent({ channelName, chatBot, logger });
        await agent.run(
            'Summarize the latest important crypto news and tweets for the crypto channel. Only include Bitcoin, Ethereum, or generic crypto/tech news. Format the output as a news digest, concise, and under 2000 characters. Ensure the message is concise and easy to read in Discord.',
            chatBot,
            channelName,
        );
    },
    executeOnStartup: true,
    name: 'crypto-twitter-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
