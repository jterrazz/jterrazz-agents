import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';

export type DevNewsJobDependencies = {
    agent: AgentPort;
};

export const createDevNewsJob = ({
    agent,
}: DevNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started');
    },
    executeOnStartup: true,
    name: 'dev-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
