import type { LoggerPort } from '@jterrazz/logger';

import { type ConfigurationPort } from '../../../../ports/inbound/configuration.port.js';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createInvestNewsAgent } from '../../../../agents/invest-news.agent.js';

export type InvestNewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    configuration: ConfigurationPort;
    logger: LoggerPort;
};

export const createInvestNewsJob = ({
    channelName,
    chatBot,
    configuration,
    logger,
}: InvestNewsJobDependencies): Job => ({
    execute: async () => {
        const apiKey = configuration.getOutboundConfiguration().googleApiKey;
        const agent = createInvestNewsAgent({ apiKey, channelName, chatBot, logger });
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'invest-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
