import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type DevelopmentNewsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createDevelopmentNewsTask = ({
    agent,
    executeOnStartup,
}: DevelopmentNewsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'development-news-agent',
    schedule: '0 16 * * 4', // Every Thursday at 4:00 PM
});
