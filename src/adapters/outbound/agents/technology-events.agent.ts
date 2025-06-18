import {
    ChatAgentAdapter,
    type ModelPort,
    PROMPTS,
    SystemPromptAdapter,
    UserPromptAdapter,
} from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type AvailableAgentTools } from '../../../ports/outbound/agents.port.js';
import { type ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

import { agentFormat as agentFormat } from './prompts/agent-format.js';
import { createAnimatorPrompt } from './prompts/animator.js';

export class TechnologyEventsAgent extends ChatAgentAdapter {
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

        const systemPrompt = new SystemPromptAdapter([
            PROMPTS.RESPONSES.SELECTIVE_ENGAGEMENT,
            PROMPTS.PERSONAS.HUMAN_LIKE_CONTRIBUTOR,
            PROMPTS.TONES.HUMOROUS,
            PROMPTS.FORMATS.DISCORD_MARKDOWN,
            PROMPTS.LANGUAGES.FRENCH_SIMPLE,
            agentFormat.discordEvents,
        ]);

        super('TechnologyEventsAgent', {
            logger,
            model,
            systemPrompt,
            tools,
            // verbose: true,
        });
    }

    async run(): Promise<null | string> {
        const prompt = new UserPromptAdapter(
            createAnimatorPrompt(
                'Important news, discussions or updates related to technology events',
            ),
            'CRITICAL: Post about events related to Apple, Microsoft, Google, Meta, CES, and Amazon.',
            'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days, only post if there is something relevant to share.',
        );

        console.log(prompt.generate());

        const result = await super.run(prompt);

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
