import config from 'config';
import { z } from 'zod';

import {
    type ConfigurationPort,
    type InboundConfiguration,
    type OutboundConfiguration,
} from '../../../ports/inbound/configuration.port.js';

const taskConfigurationSchema = z.object({
    enabled: z.boolean(),
    executeOnStartup: z.boolean(),
});

const configurationSchema = z.object({
    inbound: z.object({
        tasks: z.object({
            aiNews: taskConfigurationSchema,
            architectureTips: taskConfigurationSchema,
            cryptoNews: taskConfigurationSchema,
            developmentNews: taskConfigurationSchema,
            financeNews: taskConfigurationSchema,
            spaceEvents: taskConfigurationSchema,
            technologyEvents: taskConfigurationSchema,
        }),
    }),
    outbound: z.object({
        apify: z.object({
            token: z.string().min(1, 'An Apify token is required'),
        }),
        discord: z.object({
            botToken: z.string().min(1, 'A Discord bot token is required'),
            channels: z.object({
                ai: z.string().min(1, 'AI channel name is required'),
                architecture: z.string().min(1, 'Architecture channel name is required'),
                crypto: z.string().min(1, 'Crypto channel name is required'),
                development: z.string().min(1, 'Development channel name is required'),
                finance: z.string().min(1, 'Finance channel name is required'),
                space: z.string().min(1, 'Space channel name is required'),
                technology: z.string().min(1, 'Technology channel name is required'),
            }),
        }),
        openrouter: z.object({
            apiKey: z.string().min(1, 'An OpenRouter API key is required'),
        }),
    }),
});

export type Configuration = z.infer<typeof configurationSchema>;

export class NodeConfigAdapter implements ConfigurationPort {
    private readonly configuration: Configuration;

    constructor() {
        this.configuration = configurationSchema.parse({
            inbound: {
                tasks: {
                    aiNews: config.get('inbound.tasks.aiNews'),
                    architectureTips: config.get('inbound.tasks.architectureTips'),
                    cryptoNews: config.get('inbound.tasks.cryptoNews'),
                    developmentNews: config.get('inbound.tasks.developmentNews'),
                    financeNews: config.get('inbound.tasks.financeNews'),
                    spaceEvents: config.get('inbound.tasks.spaceEvents'),
                    technologyEvents: config.get('inbound.tasks.technologyEvents'),
                },
            },
            outbound: {
                apify: {
                    token: config.get('outbound.apify.token'),
                },
                discord: {
                    botToken: config.get('outbound.discord.botToken'),
                    channels: config.get('outbound.discord.channels'),
                },
                openrouter: {
                    apiKey: config.get('outbound.openrouter.apiKey'),
                },
            },
        });
    }

    getInboundConfiguration(): InboundConfiguration {
        return {
            tasks: this.configuration.inbound.tasks,
        };
    }

    getOutboundConfiguration(): OutboundConfiguration {
        return {
            apifyToken: this.configuration.outbound.apify.token,
            discordBotToken: this.configuration.outbound.discord.botToken,
            discordChannels: this.configuration.outbound.discord.channels,
            openrouterApiKey: this.configuration.outbound.openrouter.apiKey,
        };
    }
}
