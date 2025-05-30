import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createSpaceEventsAgent } from '../../../../agents/space-events.agent.js';

export type SpaceEventsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createSpaceEventsJob = ({
    channelName,
    chatBot,
    logger,
}: SpaceEventsJobDependencies): Job => ({
    execute: async () => {
        const agent = createSpaceEventsAgent({ channelName, chatBot, logger });
        await agent.run('New task received to post space events', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'space-events-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
 