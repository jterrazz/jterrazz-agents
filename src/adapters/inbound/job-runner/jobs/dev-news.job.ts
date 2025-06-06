import type { LoggerPort } from '@jterrazz/logger';

import { type ConfigurationPort } from '../../../../ports/inbound/configuration.port.js';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createDevNewsAgent } from '../../../../agents/dev-news.agent.js';

export type DevNewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    configuration: ConfigurationPort;
    logger: LoggerPort;
};

export const createDevNewsJob = ({
    channelName,
    chatBot,
    configuration,
    logger,
}: DevNewsJobDependencies): Job => ({
    execute: async () => {
        const { apifyToken, googleApiKey } = configuration.getOutboundConfiguration();
        const agent = createDevNewsAgent({
            apifyToken,
            apiKey: googleApiKey,
            channelName,
            chatBot,
            logger,
        });
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'dev-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
