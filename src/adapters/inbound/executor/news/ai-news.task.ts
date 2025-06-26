import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type AINewsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createAINewsTask = ({ agent, executeOnStartup }: AINewsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'ai-news-agent',
    schedule: '0 16 * * 4', // Every Thursday at 4:00 PM
});
