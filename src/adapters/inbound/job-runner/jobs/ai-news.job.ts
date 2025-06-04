import type { LoggerPort } from '@jterrazz/logger';

import { type ConfigurationPort } from '../../../../ports/inbound/configuration.port.js';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createAINewsAgent } from '../../../../agents/ai-news.agent.js';

export type AINewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    configuration: ConfigurationPort;
    logger: LoggerPort;
};

export const createAINewsJob = ({ channelName, chatBot, configuration, logger }: AINewsJobDependencies): Job => ({
    execute: async () => {
        const apiKey = configuration.getOutboundConfiguration().googleApiKey;
        const agent = createAINewsAgent({ apiKey, channelName, chatBot, logger });
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'ai-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
