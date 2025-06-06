import type { BaseLanguageModel } from '@langchain/core/language_models/base';
import { ChatGoogleGenerativeAI, type GoogleGenerativeAIChatInput } from '@langchain/google-genai';

import type { AIPort } from '../../../ports/outbound/ai.port.js';

export class GoogleAIAdapter implements AIPort {
    private model: BaseLanguageModel;

    constructor(apiKey: string, modelConfig?: GoogleGenerativeAIChatInput) {
        this.model = new ChatGoogleGenerativeAI(
            modelConfig ?? {
                apiKey,
                maxOutputTokens: 64_000,
                model: 'gemini-2.5-flash-preview-05-20',
            },
        );
    }

    getModel(): BaseLanguageModel {
        return this.model;
    }
}
