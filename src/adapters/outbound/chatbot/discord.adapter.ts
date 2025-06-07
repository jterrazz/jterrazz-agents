import type { LoggerPort } from '@jterrazz/logger';
import { type Channel, Client, GatewayIntentBits, type TextChannel } from 'discord.js';

import type { ChatBotMessage, ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

const CONNECTION_TIMEOUT_MS = 10000; // 10 seconds timeout
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds between retries

interface ConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    retryCount: number;
}

export class DiscordAdapter implements ChatBotPort {
    private client: Client;
    private logger: LoggerPort;
    private state: ConnectionState = {
        isConnected: false,
        isConnecting: false,
        retryCount: 0,
    };
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

        this.setupEventHandlers();
    }

    async connect(): Promise<void> {
        if (!this.token) {
            throw new Error('A Discord bot token is required');
        }

        if (this.state.isConnected) {
            this.logger.info('Discord client already connected');
            return;
        }

        if (this.state.isConnecting) {
            this.logger.info('Discord connection already in progress');
            return;
        }

        this.state.isConnecting = true;
        this.state.retryCount = 0;

        try {
            await this.connectWithRetry();
        } finally {
            this.state.isConnecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            this.client.destroy();
            this.state.isConnected = false;
            this.logger.info('Discord client disconnected');
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

    private async attemptConnection(): Promise<void> {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), CONNECTION_TIMEOUT_MS);

        try {
            // Login to Discord
            await Promise.race([
                this.client.login(this.token),
                this.createAbortPromise(abortController, 'Discord login timeout'),
            ]);

            // Wait for ready event
            if (!this.state.isConnected) {
                await Promise.race([
                    this.waitForReady(),
                    this.createAbortPromise(abortController, 'Discord ready event timeout'),
                ]);
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private async connectWithRetry(): Promise<void> {
        while (this.state.retryCount < MAX_RETRY_ATTEMPTS) {
            try {
                await this.attemptConnection();
                return;
            } catch (error) {
                this.state.retryCount++;
                const isLastAttempt = this.state.retryCount >= MAX_RETRY_ATTEMPTS;

                this.logger.error(`Discord connection attempt ${this.state.retryCount} failed:`, {
                    error: error instanceof Error ? error.message : String(error),
                    isLastAttempt,
                });

                if (isLastAttempt) {
                    throw new Error(
                        `Failed to connect to Discord after ${MAX_RETRY_ATTEMPTS} attempts: ${error instanceof Error ? error.message : String(error)}`,
                    );
                }

                await this.delay(RETRY_DELAY_MS * this.state.retryCount); // Exponential backoff
            }
        }
    }

    private createAbortPromise(controller: AbortController, message: string): Promise<never> {
        return new Promise((_, reject) => {
            controller.signal.addEventListener('abort', () => {
                reject(new Error(message));
            });
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private setupEventHandlers(): void {
        this.client.on('ready', () => {
            this.state.isConnected = true;
            this.logger.info(`Bot connecté en tant que ${this.client.user?.tag}`);
        });

        this.client.on('disconnect', () => {
            this.state.isConnected = false;
            this.logger.warn('Discord client disconnected');
        });

        this.client.on('error', (error) => {
            this.logger.error('Discord client error:', {
                error: error.message,
            });
        });
    }

    private waitForReady(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.state.isConnected) {
                resolve();
                return;
            }

            const onReady = () => {
                this.client.off('ready', onReady);
                resolve();
            };

            this.client.once('ready', onReady);
        });
    }
}
