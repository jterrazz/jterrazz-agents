import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type FinanceNewsJobDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createFinanceNewsJob = ({
    agent,
    executeOnStartup,
}: FinanceNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'finance-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
