import { createContainer } from './di/container.js';

export const token = process.env.DISCORD_BOT_TOKEN;
export const channelName = 'space';

(async () => {
    const container = createContainer();
    const chatBot = container.get('ChatBot');
    await chatBot.connect();

    // Initialize job runner for scheduled jobs
    const jobRunner = container.get('JobRunner');
    await jobRunner.initialize();
})();
