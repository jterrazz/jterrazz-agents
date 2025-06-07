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
        return `The chatbot did not post any messages.`;
    }

    return messages.map(formatChatBotMessage).join('\n\n');
};
