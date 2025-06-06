import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import { type AgentPort } from '../../../../ports/outbound/agent.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

export type AINewsJobDependencies = {
    agent: AgentPort;
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createAINewsJob = ({
    agent,
    channelName,
    chatBot,
    logger,
}: AINewsJobDependencies): Job => ({
    execute: async () => {
        await agent.run('New task started', chatBot, channelName);
    },
    executeOnStartup: true,
    name: 'ai-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
