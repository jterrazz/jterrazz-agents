export interface ConfigurationPort {
    getOutboundConfiguration(): OutboundConfigurationPort;
}

export interface OutboundConfigurationPort {
    discordBotToken: string;
    googleApiKey: string;
    tavilyApiKey?: string;
}
