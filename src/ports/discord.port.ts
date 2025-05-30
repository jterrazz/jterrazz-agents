export interface ChatBotPort {
    connect(): Promise<void>;
    sendMessage(channelName: string, message: string): Promise<void>;
    // Add more methods as needed (e.g., disconnect, fetchMessages, etc.)
}
