import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createCryptoNewsAgent } from '../../../../agents/crypto-news.agent.js';

export type CryptoNewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createCryptoNewsJob = ({
    channelName,
    chatBot,
    logger,
}: CryptoNewsJobDependencies): Job => ({
    execute: async () => {
        const agent = createCryptoNewsAgent({ channelName, chatBot, logger });
        await agent.run('New task received to post crypto news', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'crypto-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
