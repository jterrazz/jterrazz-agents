import {
    AutonomousAgentAdapter,
    type ModelPort,
    PROMPT_LIBRARY,
    SystemPromptAdapter,
    UserPromptAdapter,
} from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type AvailableAgentTools } from '../../../ports/outbound/agents.port.js';
import { type ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

import { PROMPTS } from './prompts/prompts.js';

export class CryptoNewsAgent extends AutonomousAgentAdapter {
    static readonly NAME = 'CryptoNewsAgent';
    static readonly SYSTEM_PROMPT = new SystemPromptAdapter([
        PROMPT_LIBRARY.RESPONSES.SELECTIVE_ENGAGEMENT,
        PROMPT_LIBRARY.PERSONAS.HUMAN_LIKE_CONTRIBUTOR,
        PROMPT_LIBRARY.TONES.HUMOROUS,
        PROMPT_LIBRARY.FORMATS.DISCORD_MARKDOWN,
        PROMPT_LIBRARY.LANGUAGES.FRENCH_SIMPLE,
        PROMPTS.FORMATS.DISCORD_NEWS,
    ]);
    static readonly USER_PROMPT = new UserPromptAdapter(
        PROMPTS.MISSIONS.ANIMATE_CHATROOM(
            'Important news, discussions or updates related to crypto, blockchain, and web3',
        ),
        'CRITICAL: Post about major cryptocurrency price movements, new blockchain projects, or significant web3 developments.',
        'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days, only post if there is something relevant to share.',
    );

    constructor(
        model: ModelPort,
        availableTools: AvailableAgentTools,
        logger: LoggerPort,
        private readonly chatBot: ChatBotPort,
        private readonly channelName: string,
    ) {
        const tools = [
            availableTools.fetchChatBotMessages.crypto,
            availableTools.getCurrentDate,
            availableTools.fetchPostsForCrypto,
        ];

        super(CryptoNewsAgent.NAME, {
            logger,
            model,
            systemPrompt: CryptoNewsAgent.SYSTEM_PROMPT,
            tools,
        });
    }

    async run(): Promise<null | string> {
        const result = await super.run(CryptoNewsAgent.USER_PROMPT);

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
