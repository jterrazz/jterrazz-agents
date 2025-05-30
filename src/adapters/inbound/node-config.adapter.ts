import config from 'config';
import { z } from 'zod';

import type { ConfigurationPort, OutboundConfigurationPort } from '../../ports/inbound/configuration.port.js';

const configurationSchema = z.object({
    outbound: z.object({
        discord: z.object({
            botToken: z.string().min(1, 'A Discord bot token is required'),
        }),
        google: z.object({
            apiKey: z.string().min(1, 'A Google API key is required'),
        }),
        tavily: z.object({
            apiKey: z.string().optional(),
        }),
    }),
});

type Configuration = z.infer<typeof configurationSchema>;

export class NodeConfigAdapter implements ConfigurationPort {
    private readonly configuration: Configuration;

    constructor() {
        this.configuration = configurationSchema.parse({
            outbound: {
                discord: {
                    botToken: config.get('outbound.discord.botToken'),
                },
                google: {
                    apiKey: config.get('outbound.google.apiKey'),
                },
                tavily: {
                    apiKey: config.has('outbound.tavily.apiKey')
                        ? config.get('outbound.tavily.apiKey')
                        : undefined,
                },
            },
        });
    }

    getOutboundConfiguration(): OutboundConfigurationPort {
        return {
            discordBotToken: this.configuration.outbound.discord.botToken,
            googleApiKey: this.configuration.outbound.google.apiKey,
            tavilyApiKey: this.configuration.outbound.tavily.apiKey,
        };
    }
}
