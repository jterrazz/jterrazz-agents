export type ChatBotMessage = {
    content: string;
    date: string;
    timeAgo: string;
};

export interface ChatBotPort {
    connect(): Promise<void>;
    getRecentBotMessages(channelName: string, limit?: number): Promise<ChatBotMessage[]>;
    sendMessage(channelName: string, message: string): Promise<void>;
}
