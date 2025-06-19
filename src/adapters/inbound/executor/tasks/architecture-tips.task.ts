import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type ArchitectureTipsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createArchitectureTipsTask = ({
    agent,
    executeOnStartup,
}: ArchitectureTipsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'architecture-tips-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
