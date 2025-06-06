import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';

export type CryptoNewsJobDependencies = {
    agent: AgentPort;
};

export const createCryptoNewsJob = ({ agent }: CryptoNewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started');
    },
    executeOnStartup: true,
    name: 'crypto-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
