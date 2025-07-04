export type ChatBotMessage = {
    content: string;
    date: Date;
};

export interface ChatBotPort {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getBotMessages(channelName: string, limit?: number): Promise<ChatBotMessage[]>;
    sendMessage(channelName: string, message: string): Promise<void>;
}
