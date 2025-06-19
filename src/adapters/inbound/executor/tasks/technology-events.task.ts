import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type TechnologyEventsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createTechnologyEventsTask = ({
    agent,
    executeOnStartup,
}: TechnologyEventsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'technology-events-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
