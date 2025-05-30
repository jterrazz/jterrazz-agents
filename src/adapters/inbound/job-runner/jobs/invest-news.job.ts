import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createInvestNewsAgent } from '../../../../agents/invest-news.agent.js';

export type InvestNewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createInvestNewsJob = ({
    channelName,
    chatBot,
    logger,
}: InvestNewsJobDependencies): Job => ({
    execute: async () => {
        const agent = createInvestNewsAgent({ channelName, chatBot, logger });
        await agent.run('New task received to post invest news', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'invest-news-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
