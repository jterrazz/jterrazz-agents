import type { LoggerPort } from '@jterrazz/logger';

import { type Job } from '../../../../ports/inbound/job-runner.port.js';
import type { ChatBotPort } from '../../../../ports/outbound/chatbot.port.js';

import { createSpaceEventsAgent } from '../../../../agents/space-events-agent.js';

export type SpaceEventsJobDependencies = {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
};

export const createSpaceEventsJob = ({
    channelName,
    chatBot,
    logger,
}: SpaceEventsJobDependencies): Job => ({
    execute: async () => {
        const agent = createSpaceEventsAgent({ channelName, chatBot, logger });
        await agent.run(
            'List the next upcoming space events with their date, location, and a short description. Format the output as a Markdown list with clear bullet points, bold event titles, and aligned date/location/description. Add spacing and visual cues for clarity. Ensure the message is concise and easy to read in Discord.',
            chatBot,
            channelName,
        );
    },
    executeOnStartup: true,
    name: 'space-events-agent',
    schedule: '0 8 * * *', // Every day at 8:00 AM
});
