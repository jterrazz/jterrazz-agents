import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type AINewsJobDependencies = {
    agent: AgentPort;
};

export const createAINewsJob = ({ agent }: AINewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup: false,
    name: 'ai-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
