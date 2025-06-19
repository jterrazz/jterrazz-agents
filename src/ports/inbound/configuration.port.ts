/**
 * Main configuration port that provides access to all configuration values
 */
export interface ConfigurationPort {
    getInboundConfiguration(): InboundConfiguration;
    getOutboundConfiguration(): OutboundConfiguration;
}

/**
 * Represents configuration for inbound scheduling and execution
 */
export interface InboundConfiguration {
    tasks: {
        aiNews: TaskConfiguration;
        architectureTips: TaskConfiguration;
        cryptoNews: TaskConfiguration;
        developmentNews: TaskConfiguration;
        financeNews: TaskConfiguration;
        spaceEvents: TaskConfiguration;
        technologyEvents: TaskConfiguration;
    };
}

/**
 * Represents configuration for outbound services like Discord
 */
export interface OutboundConfiguration {
    apifyToken: string;
    discordBotToken: string;
    discordChannels: {
        ai: string;
        architecture: string;
        crypto: string;
        development: string;
        finance: string;
        space: string;
        technology: string;
    };
    openrouterApiKey: string;
}

/**
 * Configuration for individual task execution
 */
export interface TaskConfiguration {
    enabled: boolean;
    executeOnStartup: boolean;
}
