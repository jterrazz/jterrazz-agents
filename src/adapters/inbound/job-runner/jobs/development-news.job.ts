import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type DevelopmentNewsJobDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createDevelopmentNewsJob = ({
    agent,
    executeOnStartup,
}: DevelopmentNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'development-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
