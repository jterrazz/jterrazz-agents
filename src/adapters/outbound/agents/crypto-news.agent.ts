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

export class CryptoNewsAgent extends ChatAgentAdapter {
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

        const systemPrompt = new SystemPromptAdapter([
            agentPersonality.human,
            agentTone.professional,
            agentFormat.discordNews,
            agentLanguage.french,
        ]);

        super('CryptoNewsAgent', {
            logger,
            model,
            systemPrompt,
            tools,
        });
    }

    async run(): Promise<null | string> {
        const prompt = new UserPromptAdapter(
            createAnimatorPrompt(
                'Important news, discussions or updates related to cryptocurrency and blockchain',
                [
                    'ONLY post about major crypto developments, regulatory news, or significant market events.',
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
