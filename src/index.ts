import { Client, GatewayIntentBits } from 'discord.js';

import { runEventsAgent } from './agents/events-agent.js';

const token = process.env.DISCORD_BOT_TOKEN;
const channelName = 'space';

if (!token) {
    throw new Error("La variable d'environnement DISCORD_BOT_TOKEN est requise.");
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', async () => {
    console.log(`Bot connecté en tant que ${client.user?.tag}`);
    const summary = await runEventsAgent(
        'List the next upcoming space events with their date, location, and a short description. Format the output as a Markdown list.',
    );
    const formattedMessage = `**🚀 Upcoming Space Events**\n\n\`\`\`markdown\n${summary}\n\`\`\``;
    client.guilds.cache.forEach(async (guild) => {
        const channel = guild.channels.cache.find(
            (ch) => ch.type === 0 && ch.name === channelName, // 0 = GuildText
        );
        if (channel && channel.isTextBased()) {
            await channel.send(formattedMessage);
            console.log(`Résumé des événements envoyé sur #${channelName}`);
        }
    });
});

client.login(token);
