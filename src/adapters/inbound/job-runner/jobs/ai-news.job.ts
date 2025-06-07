import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

import { commonJobPrompt } from './common/prompt.js';

export type AINewsJobDependencies = {
    agent: AgentPort;
};

export const createAINewsJob = ({ agent }: AINewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run(commonJobPrompt);
    },
    executeOnStartup: true,
    name: 'ai-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
