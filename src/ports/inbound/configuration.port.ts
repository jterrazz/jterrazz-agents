export interface ConfigurationPort {
    getOutboundConfiguration(): OutboundConfigurationPort;
}

export interface OutboundConfigurationPort {
    apifyToken: string;
    discordBotToken: string;
    googleApiKey: string;
}
