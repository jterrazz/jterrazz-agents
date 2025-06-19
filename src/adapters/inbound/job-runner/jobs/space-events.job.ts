import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type SpaceEventsJobDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createSpaceEventsJob = ({
    agent,
    executeOnStartup,
}: SpaceEventsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'space-events-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
