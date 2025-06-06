import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';

export type TechnologyEventsJobDependencies = {
    agent: AgentPort;
};

export const createTechnologyEventsJob = ({ agent }: TechnologyEventsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started');
    },
    executeOnStartup: true,
    name: 'technology-events-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
