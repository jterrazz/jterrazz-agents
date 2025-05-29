import { Client, GatewayIntentBits } from 'discord.js';

const token = process.env.DISCORD_BOT_TOKEN;
const channelName = 'space';
const messageContent = `Ceci est un message envoyé automatiquement par le bot Discord (jterrazz-agents) pour tester l'intégration.`;

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
    client.guilds.cache.forEach(async (guild) => {
        const channel = guild.channels.cache.find(
            (ch) => ch.type === 0 && ch.name === channelName, // 0 = GuildText
        );
        if (channel && channel.isTextBased()) {
            await channel.send(messageContent);
            console.log(`Message envoyé sur #${channelName}`);
        }
    });
});

client.login(token);
