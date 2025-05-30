export interface ChatBotPort {
    connect(): Promise<void>;
    getRecentBotMessages(channelName: string, limit?: number): Promise<string[]>;
    sendMessage(channelName: string, message: string): Promise<void>;
}
