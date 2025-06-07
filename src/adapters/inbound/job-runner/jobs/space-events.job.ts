import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

import { commonJobPrompt } from './common/job-prompt.js';

export type SpaceEventsJobDependencies = {
    agent: AgentPort;
};

export const createSpaceEventsJob = ({ agent }: SpaceEventsJobDependencies): Job => ({
    execute: async () => {
        await agent.run(commonJobPrompt);
    },
    executeOnStartup: true,
    name: 'space-events-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
