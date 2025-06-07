import { formatDate } from './date-formatter.js';
import { formatTimeAgo } from './time-ago-formatter.js';

interface ChatBotMessage {
    content: string;
    date: Date;
}

export const formatChatBotMessage = (message: ChatBotMessage): string => {
    return `Date: ${formatDate(message.date)} (${formatTimeAgo(message.date)})\nContent: ${message.content}\n`;
};

export const formatChatBotMessages = (messages: ChatBotMessage[]): string => {
    if (messages.length === 0) {
        return `No recent messages posted by the chatbot.`;
    }

    return messages.map(formatChatBotMessage).join('\n');
}; 