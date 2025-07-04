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

export class SpaceEventsAgent extends AutonomousAgentAdapter {
    static readonly NAME = 'SpaceEventsAgent';
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
            'Upcoming events related to space exploration, space missions, and aerospace technology',
        ),
        'CRITICAL: for "rocket-launch" events, only post about Starship. For "space-mission" events, post about all events',
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
            availableTools.fetchChatBotMessages.space,
            availableTools.getCurrentDate,
            availableTools.fetchEventsForSpace,
        ];

        super(SpaceEventsAgent.NAME, {
            logger,
            model,
            systemPrompt: SpaceEventsAgent.SYSTEM_PROMPT,
            tools,
        });
    }

    async run(): Promise<null | string> {
        const result = await super.run(SpaceEventsAgent.USER_PROMPT);

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
