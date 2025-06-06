import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';

export type FinanceNewsJobDependencies = {
    agent: AgentPort;
};

export const createFinanceNewsJob = ({
    agent,
}: FinanceNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started');
    },
    executeOnStartup: true,
    name: 'finance-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
