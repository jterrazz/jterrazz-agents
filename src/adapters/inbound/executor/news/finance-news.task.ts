import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type FinanceNewsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createFinanceNewsTask = ({
    agent,
    executeOnStartup,
}: FinanceNewsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'finance-news-agent',
    schedule: '0 16 * * 4', // Every Thursday at 4:00 PM
});
