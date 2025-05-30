import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createTechEventsAgent } from '../../../../agents/tech-events.agent.js';

export type TechEventsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createTechEventsJob = ({
    channelName,
    chatBot,
    logger,
}: TechEventsJobDependencies): Job => ({
    execute: async () => {
        const agent = createTechEventsAgent({ channelName, chatBot, logger });
        await agent.run('New task received to post tech events', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'tech-events-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
