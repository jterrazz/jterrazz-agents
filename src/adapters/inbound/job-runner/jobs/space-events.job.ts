import type { LoggerPort } from '@jterrazz/logger';

import { type ConfigurationPort } from '../../../../ports/inbound/configuration.port.js';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createSpaceEventsAgent } from '../../../../agents/space-events.agent.js';

export type SpaceEventsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    configuration: ConfigurationPort;
    logger: LoggerPort;
};

export const createSpaceEventsJob = ({
    channelName,
    chatBot,
    configuration,
    logger,
}: SpaceEventsJobDependencies): Job => ({
    execute: async () => {
        const apiKey = configuration.getOutboundConfiguration().googleApiKey;
        const agent = createSpaceEventsAgent({ apiKey, channelName, chatBot, logger });
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'space-events-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
 