import {
    BasicAgentAdapter,
    type ModelPort,
    PROMPT_LIBRARY,
    SystemPromptAdapter,
    UserPromptAdapter,
} from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

import { PROMPTS } from './prompts/prompts.js';
import { formatChatBotMessages } from './tools/formatters/chatbot-message-formatter.js';

export class ArchitectureTipsAgent extends BasicAgentAdapter {
    static readonly NAME = 'ArchitectureTipsAgent';
    static readonly SYSTEM_PROMPT = new SystemPromptAdapter([
        PROMPT_LIBRARY.RESPONSES.CONTEXTUAL_ENGAGEMENT,
        PROMPT_LIBRARY.PERSONAS.EXPERT_ADVISOR,
        PROMPT_LIBRARY.TONES.NEUTRAL,
        PROMPT_LIBRARY.FORMATS.DISCORD_MARKDOWN,
        PROMPT_LIBRARY.LANGUAGES.FRENCH_SIMPLE,
    ]);
    constructor(
        model: ModelPort,
        private readonly logger: LoggerPort,
        private readonly chatBot: ChatBotPort,
        private readonly channelName: string,
    ) {
        super(ArchitectureTipsAgent.NAME, {
            logger,
            model,
            systemPrompt: ArchitectureTipsAgent.SYSTEM_PROMPT,
        });
    }

    static readonly USER_PROMPT = (chatbotLastMessages: string) =>
        new UserPromptAdapter(
            PROMPTS.MISSIONS.ANIMATE_CHATROOM(
                'Architecture related tips, design patterns, and software architecture best practices',
            ),
            'CRITICAL: Behave like an professional software architect, sharing practical and useful information.',
            'CRITICAL: Try changing or deepening the topic of the last message, as you want, maintain a good balance of topics.',
            'CRITICAL: The team usually uses Typescript, Node.js, React, Next.JS, Solidity, and other modern technologies. But you can post about other technologies.',
            'You can give code examples following the discord markdown format.',
            'SUPER IMPORTANT REQUIREMENT: THE DISCORD MESSAGE DO NOT ACCEPT MESSAGES OVER 1500 LETTERS. TRY TO KEEP THE MESSAGE LENGTH AROUND 1500 LETTERS.',
            `Here are all your last messages from the chatroomm: ${chatbotLastMessages}`,
        );

    async run(): Promise<null | string> {
        const messages = await this.chatBot.getBotMessages(this.channelName);

        // Messages from less than 24h
        const last24hMessages = messages.filter((message) => {
            const messageDate = new Date(message.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - messageDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 1;
        });
        if (last24hMessages.length !== 0) {
            this.logger.info(
                `[${ArchitectureTipsAgent.NAME}] Bot already posted in the last 24h in the ${this.channelName} channel, skipping...`,
            );
            return null;
        }

        const chatbotLastMessages = formatChatBotMessages(messages);
        let result = await super.run(ArchitectureTipsAgent.USER_PROMPT(chatbotLastMessages));

        if (result && result.length > 1500) {
            result = await super.run(
                new UserPromptAdapter(
                    `Rewrite this discord message to be around 1500 letters.`,
                    result,
                ),
            );
        }

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
