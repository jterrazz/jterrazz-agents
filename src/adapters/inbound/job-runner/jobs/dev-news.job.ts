import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createDevNewsAgent } from '../../../../agents/dev-news.agent.js';

export type DevNewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createDevNewsJob = ({
    channelName,
    chatBot,
    logger,
}: DevNewsJobDependencies): Job => ({
    execute: async () => {
        const agent = createDevNewsAgent({ channelName, chatBot, logger });
        await agent.run(
            'Summarize the latest important dev news, open source updates, and tweets for the dev channel. Only include software development, open source, or general dev/tech news. Format the output as a news digest, concise, and under 2000 characters. Ensure the message is concise and easy to read in Discord.',
            chatBot,
            channelName,
        );
    },
    executeOnStartup: true,
    name: 'dev-news-agent',
    schedule: '0 17 * * *', // Every day at 5:00 PM
});
 