import config from 'config';
import { z } from 'zod';

import {
    type ConfigurationPort,
    type OutboundConfigurationPort,
} from '../../../ports/inbound/configuration.port.js';

const configurationSchema = z.object({
    outbound: z.object({
        apify: z.object({
            token: z.string().min(1, 'An Apify token is required'),
        }),
        discord: z.object({
            botToken: z.string().min(1, 'A Discord bot token is required'),
        }),
        google: z.object({
            apiKey: z.string().min(1, 'A Google API key is required'),
        }),
    }),
});

export type Configuration = z.infer<typeof configurationSchema>;

export class NodeConfigAdapter implements ConfigurationPort {
    private readonly configuration: Configuration;

    constructor() {
        this.configuration = configurationSchema.parse({
            outbound: {
                apify: {
                    token: config.get('outbound.apify.token'),
                },
                discord: {
                    botToken: config.get('outbound.discord.botToken'),
                },
                google: {
                    apiKey: config.get('outbound.google.apiKey'),
                },
            },
        });
    }

    getOutboundConfiguration(): OutboundConfigurationPort {
        return {
            apifyToken: this.configuration.outbound.apify.token,
            discordBotToken: this.configuration.outbound.discord.botToken,
            googleApiKey: this.configuration.outbound.google.apiKey,
        };
    }
}
