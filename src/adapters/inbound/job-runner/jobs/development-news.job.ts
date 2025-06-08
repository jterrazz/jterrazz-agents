import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

export type DevelopmentNewsJobDependencies = {
    agent: AgentPort;
};

export const createDevelopmentNewsJob = ({ agent }: DevelopmentNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('');
    },
    executeOnStartup: true,
    name: 'development-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
