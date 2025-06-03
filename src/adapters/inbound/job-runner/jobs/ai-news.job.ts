import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createAINewsAgent } from '../../../../agents/ai-news.agent.js';

export type AINewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createAINewsJob = ({ channelName, chatBot, logger }: AINewsJobDependencies): Job => ({
    execute: async () => {
        const agent = createAINewsAgent({ channelName, chatBot, logger });
        console.log('Running AI news agent');
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'ai-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
