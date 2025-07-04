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

export class DevelopmentNewsAgent extends AutonomousAgentAdapter {
    static readonly NAME = 'DevelopmentNewsAgent';
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
            'Important news, discussions or updates related to software development and programming',
        ),
        'CRITICAL: Post about major library/framework updates, new programming language features, or significant software releases.',
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
            availableTools.fetchChatBotMessages.development,
            availableTools.getCurrentDate,
            availableTools.fetchPostsForDevelopment,
        ];

        super(DevelopmentNewsAgent.NAME, {
            logger,
            model,
            systemPrompt: DevelopmentNewsAgent.SYSTEM_PROMPT,
            tools,
        });
    }

    async run(): Promise<null | string> {
        const result = await super.run(DevelopmentNewsAgent.USER_PROMPT);

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
