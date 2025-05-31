import type { LoggerPort } from '@jterrazz/logger';
import { type Channel, Client, GatewayIntentBits, type TextChannel } from 'discord.js';

import type { ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

export class DiscordAdapter implements ChatBotPort {
    private client: Client;
    private logger: LoggerPort;
    private token: string;

    constructor(token: string, logger: LoggerPort) {
        this.token = token;
        this.logger = logger;
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
                this.logger.info(`Bot connecté en tant que ${this.client.user?.tag}`);
                resolve();
            });
        });
    }
    async getRecentBotMessages(
        channelName: string,
        limit = 20,
    ): Promise<{ content: string; date: string }[]> {
        const guild = this.client.guilds.cache.first();
        if (!guild) return [];
        const channel = guild.channels.cache.find(
            (ch: Channel) => ch.type === 0 && ch.name === channelName,
        );
        if (!channel || !channel.isTextBased()) return [];
        const messages = await channel.messages.fetch({ limit });
        return messages
            .filter((msg) => msg.author.id === this.client.user?.id)
            .map((msg) => ({
                content: msg.content,
                date: msg.createdAt.toISOString(),
            }));
    }

    async sendMessage(channelName: string, message: string): Promise<void> {
        const guilds = this.client.guilds.cache;
        for (const guild of Array.from(guilds.values())) {
            const channel = guild.channels.cache.find(
                (ch: Channel) => ch.type === 0 && ch.name === channelName,
            );
            if (channel && channel.isTextBased()) {
                await (channel as TextChannel).send(message);
            }
        }
    }
}
