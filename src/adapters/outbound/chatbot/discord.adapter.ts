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
    ): Promise<{ content: string; date: string; timeAgo: string }[]> {
        const guild = this.client.guilds.cache.first();
        if (!guild) return [];
        const channel = guild.channels.cache.find(
            (ch: Channel) => ch.type === 0 && ch.name === channelName,
        );
        if (!channel || !channel.isTextBased()) return [];
        const messages = await channel.messages.fetch({ limit });
        return messages
            .filter((msg) => msg.author.id === this.client.user?.id)
            .map((msg) => {
                const date = msg.createdAt.toISOString();
                return {
                    content: msg.content,
                    date,
                    timeAgo: formatTimeAgo(msg.createdAt),
                };
            });
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

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `posted ${diffSec} second${diffSec === 1 ? '' : 's'} ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `posted ${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `posted ${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `posted ${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    const diffWk = Math.floor(diffDay / 7);
    if (diffWk < 4) return `posted ${diffWk} week${diffWk === 1 ? '' : 's'} ago`;
    const diffMo = Math.floor(diffDay / 30);
    if (diffMo < 12) return `posted ${diffMo} month${diffMo === 1 ? '' : 's'} ago`;
    const diffYr = Math.floor(diffDay / 365);
    return `posted ${diffYr} year${diffYr === 1 ? '' : 's'} ago`;
}
