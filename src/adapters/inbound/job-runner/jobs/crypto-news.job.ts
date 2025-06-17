import { type AgentPort } from '@jterrazz/intelligence';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';

export type CryptoNewsJobDependencies = {
    agent: AgentPort;
};

export const createCryptoNewsJob = ({ agent }: CryptoNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup: false,
    name: 'crypto-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
