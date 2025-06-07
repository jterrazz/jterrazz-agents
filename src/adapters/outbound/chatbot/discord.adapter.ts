import type { LoggerPort } from '@jterrazz/logger';
import { type Channel, Client, GatewayIntentBits, type TextChannel } from 'discord.js';

import type { ChatBotMessage, ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

const CONNECTION_TIMEOUT_MS = 10000; // 10 seconds timeout

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

        try {
            await Promise.race([
                this.client.login(this.token),
                new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Discord connection timeout')),
                        CONNECTION_TIMEOUT_MS,
                    ),
                ),
            ]);

            await Promise.race([
                new Promise<void>((resolve) => {
                    this.client.once('ready', () => {
                        this.logger.info(`Bot connecté en tant que ${this.client.user?.tag}`);
                        resolve();
                    });
                }),
                new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Discord ready event timeout')),
                        CONNECTION_TIMEOUT_MS,
                    ),
                ),
            ]);
        } catch (error) {
            this.logger.error('Failed to connect to Discord:', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async getRecentBotMessages(channelName: string, limit = 20): Promise<ChatBotMessage[]> {
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
                date: msg.createdAt,
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
