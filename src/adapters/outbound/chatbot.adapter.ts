import { type Channel, Client, GatewayIntentBits, type TextChannel } from 'discord.js';

import type { ChatBotPort } from '../../ports/outbound/chatbot.port.js';

export class DiscordAdapter implements ChatBotPort {
    private client: Client;
    private token: string;

    constructor(token: string) {
        this.token = token;
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    async connect(): Promise<void> {
        if (!this.token) {
            throw new Error('A Discord bot token is required');
        }
        await this.client.login(this.token);
        await new Promise<void>((resolve) => {
            this.client.once('ready', () => {
                console.log(`Bot connecté en tant que ${this.client.user?.tag}`);
                resolve();
            });
        });
    }

    // Optionally expose the client for advanced use
    getClient(): Client {
        return this.client;
    }

    async getRecentBotMessages(channelName: string, limit = 10): Promise<string[]> {
        const guild = this.client.guilds.cache.first();
        if (!guild) return [];
        const channel = guild.channels.cache.find(
            (ch: Channel) => ch.type === 0 && ch.name === channelName,
        );
        if (!channel || !channel.isTextBased()) return [];
        const messages = await channel.messages.fetch({ limit });
        return messages
            .filter((msg) => msg.author.id === this.client.user?.id)
            .map((msg) => msg.content);
    }

    async sendMessage(channelName: string, message: string): Promise<void> {
        const guilds = this.client.guilds.cache;
        for (const guild of Array.from(guilds.values())) {
            const channel = guild.channels.cache.find(
                (ch: Channel) => ch.type === 0 && ch.name === channelName,
            );
            if (channel && channel.isTextBased()) {
                await (channel as TextChannel).send(message);
                console.log(`Message sent to #${channelName}`);
            }
        }
    }
}
