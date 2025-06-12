import type { BaseLanguageModel } from '@langchain/core/language_models/base';
import { ChatOpenAI, type OpenAIChatInput } from '@langchain/openai';

import type { AIPort } from '../../../ports/outbound/ai.port.js';

export class OpenRouterAIAdapter implements AIPort {
    private readonly model: BaseLanguageModel;

    constructor(apiKey: string, options?: Partial<OpenAIChatInput>) {
        this.model = new ChatOpenAI({
            modelName: 'google/gemini-2.5-flash-preview-05-20:thinking',
            ...options,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': 'https://jterrazz.com',
                    'X-Title': 'jterrazz-agents',
                },
            },
            openAIApiKey: apiKey,
        });
    }

    getModel(): BaseLanguageModel {
        return this.model;
    }
}
