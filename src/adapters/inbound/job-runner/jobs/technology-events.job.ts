import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

export type TechnologyEventsJobDependencies = {
    agent: AgentPort;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createTechnologyEventsJob = ({
    agent,
    chatBot,
    logger,
}: TechnologyEventsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started');
    },
    executeOnStartup: true,
    name: 'technology-events-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
