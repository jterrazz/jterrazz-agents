import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createInvestNewsAgent } from '../../../../agents/invest-news.agent.js';

export type InvestNewsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createInvestNewsJob = ({
    channelName,
    chatBot,
    logger,
}: InvestNewsJobDependencies): Job => ({
    execute: async () => {
        const agent = createInvestNewsAgent({ channelName, chatBot, logger });
        await agent.run(
            'Summarize the latest important financial news and tweets for the invest channel. Format the output as a Markdown list with clear bullet points, bold event titles, and aligned date/location/description. Add spacing and visual cues for clarity. Ensure the message is concise and easy to read in Discord.',
            chatBot,
            channelName,
        );
    },
    executeOnStartup: true,
    name: 'invest-news-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
