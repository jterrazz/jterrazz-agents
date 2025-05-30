export interface ChatBotPort {
    connect(): Promise<void>;
    getRecentBotMessages(channelName: string, limit?: number): Promise<RecentBotMessage[]>;
    sendMessage(channelName: string, message: string): Promise<void>;
}

export type RecentBotMessage = {
    content: string;
    date: string; // ISO 8601 string
};
