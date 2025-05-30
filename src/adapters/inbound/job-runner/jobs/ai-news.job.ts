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
        await agent.run(
            'Summarize the latest important AI news, discussions, and tweets for the ai channel. Only include AI, ML, or general tech/AI news. Format the output as a news digest, concise, and under 2000 characters. Ensure the message is concise and easy to read in Discord.',
            chatBot,
            channelName,
        );
    },
    executeOnStartup: true,
    name: 'ai-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
