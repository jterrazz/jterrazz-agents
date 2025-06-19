import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type ArchitectureTipsJobDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createArchitectureTipsJob = ({
    agent,
    executeOnStartup,
}: ArchitectureTipsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'architecture-tips-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
