import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createInvestAgent } from '../../../../agents/invest-agent.js';

export type InvestTwitterJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createInvestTwitterJob = ({
    channelName,
    chatBot,
    logger,
}: InvestTwitterJobDependencies): Job => ({
    execute: async () => {
        const agent = createInvestAgent({ channelName, chatBot, logger });
        await agent.run(
            'Summarize the latest important financial news and tweets for the invest channel. Format the output as a Markdown list with clear bullet points, bold event titles, and aligned date/location/description. Add spacing and visual cues for clarity. Ensure the message is concise and easy to read in Discord.',
            chatBot,
            channelName,
        );
    },
    executeOnStartup: true,
    name: 'invest-twitter-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
