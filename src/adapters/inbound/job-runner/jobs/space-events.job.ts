import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

export type SpaceEventsJobDependencies = {
    agent: AgentPort;
};

export const createSpaceEventsJob = ({ agent }: SpaceEventsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('');
    },
    executeOnStartup: true,
    name: 'space-events-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
