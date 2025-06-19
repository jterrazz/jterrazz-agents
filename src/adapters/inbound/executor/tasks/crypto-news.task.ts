import { type AgentPort } from '@jterrazz/intelligence';

import { type TaskPort } from '../../../../ports/inbound/executor.port.js';

export type CryptoNewsTaskDependencies = {
    agent: AgentPort;
    executeOnStartup: boolean;
};

export const createCryptoNewsTask = ({
    agent,
    executeOnStartup,
}: CryptoNewsTaskDependencies): TaskPort => ({
    execute: async () => {
        await agent.run();
    },
    executeOnStartup,
    name: 'crypto-news-agent',
    schedule: '0 16 * * 1,4', // Every Monday and Thursday at 4:00 PM
});
