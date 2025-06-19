import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type TechnologyEventsJobDependencies = {
    agent: AgentPort;
};

export const createTechnologyEventsJob = ({ agent }: TechnologyEventsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup: true,
    name: 'technology-events-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
