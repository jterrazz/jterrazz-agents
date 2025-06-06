import type { ChatBotPort } from './chatbot.port.js';

export interface AgentPort {
    run(userQuery: string, chatBot: ChatBotPort, channelName: string): Promise<void>;
} 