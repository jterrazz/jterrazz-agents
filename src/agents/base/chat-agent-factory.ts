import type { LoggerPort } from '@jterrazz/logger';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import type { DynamicTool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI, type GoogleGenerativeAIChatInput } from '@langchain/google-genai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

import type { ChatBotPort } from '../../ports/outbound/chatbot.port.js';

export type NewsAgentOptions = {
    logger?: LoggerPort;
    modelConfig?: GoogleGenerativeAIChatInput;
    promptTemplate: Array<[string, string]>;
    tools: Array<DynamicTool<string>>;
};

export function createChatAgent({ logger, modelConfig, promptTemplate, tools }: NewsAgentOptions) {
    const model = new ChatGoogleGenerativeAI(
        modelConfig ?? {
            maxOutputTokens: 64_000,
            model: 'gemini-2.5-flash-preview-05-20',
        },
    );
    const prompt = ChatPromptTemplate.fromMessages(promptTemplate);
    let executorPromise: null | Promise<AgentExecutor> = null;
    return {
        async run(userQuery: string, chatBot: ChatBotPort, channelName: string): Promise<void> {
            if (!executorPromise) {
                executorPromise = (async () => {
                    const agent = await createStructuredChatAgent({
                        llm: model,
                        prompt,
                        tools,
                    });
                    return AgentExecutor.fromAgentAndTools({ agent, tools });
                })();
            }
            const executor = await executorPromise;
            const result = await executor.invoke({ input: userQuery });
            const parsed = extractJson(result.output);
            if (!isAgentResponse(parsed)) {
                logger?.error('Agent response is not valid JSON', { output: result.output });
                return;
            }
            if (parsed.action === 'post' && parsed.content) {
                await chatBot.sendMessage(channelName, parsed.content);
                logger?.info(`Message sent to #${channelName}`);
            } else if (parsed.action === 'noop') {
                logger?.info(parsed.reason ?? 'No reason provided for noop action');
            } else {
                logger?.error('Unknown agent action', { parsed });
            }
        },
    };
}

function extractJson(text: unknown): unknown {
    if (typeof text === 'object' && text !== null) return text;
    if (typeof text === 'string') {
        const match = text.match(/```json\s*([\s\S]*?)```/i);
        const jsonString = match ? match[1] : text;
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            try {
                return eval('(' + jsonString + ')');
            } catch {
                return null;
            }
        }
    }
    return null;
}

function isAgentResponse(
    obj: unknown,
): obj is { action: string; content?: string; reason?: string } {
    if (typeof obj !== 'object' || obj === null) return false;
    if (!Object.prototype.hasOwnProperty.call(obj, 'action')) return false;
    const action = (obj as Record<string, unknown>).action;
    return typeof action === 'string';
}
