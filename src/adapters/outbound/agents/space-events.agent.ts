import {
    ChatAgentAdapter,
    type ModelPort,
    SystemPromptAdapter,
    UserPromptAdapter,
} from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { type AvailableAgentTools } from '../../../ports/outbound/agents.port.js';
import { type ChatBotPort } from '../../../ports/outbound/chatbot.port.js';

import { agentFormat as agentFormat } from './prompts/agent-format.js';
import { agentLanguage as agentLanguage } from './prompts/agent-language.js';
import { agentPersonality as agentPersonality } from './prompts/agent-personality.js';
import { agentTone as agentTone } from './prompts/agent-tone.js';
import { createAnimatorPrompt } from './prompts/animator.js';

export class SpaceEventsAgent extends ChatAgentAdapter {
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

        const systemPrompt = new SystemPromptAdapter([
            agentPersonality.human,
            agentTone.fun,
            agentFormat.discordEvents,
            agentLanguage.french,
        ]);

        super('SpaceEventsAgent', {
            logger,
            model,
            systemPrompt,
            tools,
        });
    }

    async run(): Promise<null | string> {
        const prompt = new UserPromptAdapter(
            createAnimatorPrompt(
                'Important news, discussions or updates related to space events',
                [
                    'ONLY post about rocket launches, space missions, and major space industry developments.',
                    'CRITICAL: Post a MAXIMUM of 1 message every 2 to 3 days',
                ],
            ),
        );

        const result = await super.run(prompt);

        if (result) {
            await this.chatBot.sendMessage(this.channelName, result);
        }

        return result;
    }
}
