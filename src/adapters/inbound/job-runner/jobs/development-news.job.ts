import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

export type DevelopmentNewsJobDependencies = {
    agent: AgentPort;
};

export const createDevelopmentNewsJob = ({ agent }: DevelopmentNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started');
    },
    executeOnStartup: true,
    name: 'development-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
