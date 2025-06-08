import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

export type FinanceNewsJobDependencies = {
    agent: AgentPort;
};

export const createFinanceNewsJob = ({ agent }: FinanceNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('');
    },
    executeOnStartup: true,
    name: 'finance-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
