import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

export type CryptoNewsJobDependencies = {
    agent: AgentPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createCryptoNewsJob = ({
    agent,
    channelName,
    chatBot,
    logger,
}: CryptoNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'crypto-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
