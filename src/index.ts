import { createContainer } from './di/container.js';

export const token = process.env.DISCORD_BOT_TOKEN;
export const channelName = 'space';

(async () => {
    const container = createContainer();
    const chatBot = container.get('ChatBotPort');
    await chatBot.connect();

    const eventsAgent = container.get('EventsAgent');
    await eventsAgent.run(
        'List the next upcoming space events with their date, location, and a short description. Format the output as a Markdown list with clear bullet points, bold event titles, and aligned date/location/description. Add spacing and visual cues for clarity. Ensure the message is concise and easy to read in Discord.',
        chatBot,
        channelName,
    );
})();
