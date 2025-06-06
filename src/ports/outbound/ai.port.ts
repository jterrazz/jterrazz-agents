import type { BaseLanguageModel } from '@langchain/core/language_models/base';

export interface AIPort {
    getModel(): BaseLanguageModel;
}
