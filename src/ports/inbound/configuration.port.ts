export interface ConfigurationPort {
    getInboundConfiguration(): InboundConfigurationPort;
    getOutboundConfiguration(): OutboundConfigurationPort;
}

export interface DiscordChannelsConfiguration {
    ai: string;
    crypto: string;
    development: string;
    finance: string;
    space: string;
    technology: string;
}

export interface InboundConfigurationPort {
    jobs: JobsConfiguration;
}

export interface JobConfiguration {
    enabled: boolean;
}

export interface JobsConfiguration {
    aiNews: JobConfiguration;
    cryptoNews: JobConfiguration;
    developmentNews: JobConfiguration;
    financeNews: JobConfiguration;
    spaceEvents: JobConfiguration;
    technologyEvents: JobConfiguration;
}

export interface OutboundConfigurationPort {
    apifyToken: string;
    discordBotToken: string;
    discordChannels: DiscordChannelsConfiguration;
    openrouterApiKey: string;
}
