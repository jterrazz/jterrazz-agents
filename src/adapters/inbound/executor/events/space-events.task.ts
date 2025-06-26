import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type SpaceEventsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createSpaceEventsTask = ({
    agent,
    executeOnStartup,
}: SpaceEventsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'space-events-agent',
    schedule: '0 16 * * 4', // Every Thursday at 4:00 PM
});
