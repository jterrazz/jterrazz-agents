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

export class TechnologyEventsAgent extends AutonomousAgentAdapter {
    static readonly NAME = 'TechnologyEventsAgent';
    static readonly SYSTEM_PROMPT = new SystemPromptAdapter([
        PROMPT_LIBRARY.RESPONSES.SELECTIVE_ENGAGEMENT,
        PROMPT_LIBRARY.PERSONAS.HUMAN_LIKE_CONTRIBUTOR,
        PROMPT_LIBRARY.TONES.HUMOROUS,
        PROMPT_LIBRARY.FORMATS.DISCORD_MARKDOWN,
        PROMPT_LIBRARY.LANGUAGES.FRENCH_SIMPLE,
        PROMPTS.FORMATS.DISCORD_EVENTS,
    ]);
    static readonly USER_PROMPT = new UserPromptAdapter(
        PROMPTS.MISSIONS.ANIMATE_CHATROOM(
            'Important news, discussions or updates related to technology events',
        ),
        'CRITICAL: ONLY post about events related to Apple, Microsoft, Google, Meta, CES, and Amazon.',
        'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days, only post if there is something relevant to share.',
        'ALWAYS START by checking the chatbot messages history to see if there is something relevant to share.',
    );

    constructor(
        model: ModelPort,
        availableTools: AvailableAgentTools,
        logger: LoggerPort,
        private readonly chatBot: ChatBotPort,
        private readonly channelName: string,
    ) {
        const tools = [
            availableTools.fetchChatBotMessages.technology,
            availableTools.getCurrentDate,
            availableTools.fetchEventsForTechnology,
        ];

        super(TechnologyEventsAgent.NAME, {
            logger,
            model,
            systemPrompt: TechnologyEventsAgent.SYSTEM_PROMPT,
            tools,
        });
    }

    async run(): Promise<null | string> {
        const result = await super.run(TechnologyEventsAgent.USER_PROMPT);

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
