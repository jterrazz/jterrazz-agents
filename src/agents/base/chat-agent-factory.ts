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

// TODO: Hot fix for retry, it should not know about the Discord API error, it should just retry the message sending
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
            let lastError: unknown = null;
            let lastContent: string | undefined = undefined;
            for (let attempt = 0; attempt < 3; attempt++) {
                const result = await executor.invoke({ input: userQuery });
                const parsed = extractJson(result.output);
                if (!isAgentResponse(parsed)) {
                    logger?.error('Agent response is not valid JSON', { output: result.output });
                    return;
                }
                if (parsed.action === 'post' && parsed.content) {
                    lastContent = parsed.content;
                    if (parsed.content.length > 2000) {
                        // Ask the LLM to strictly shorten the message
                        userQuery = `The last message you generated was too long (${parsed.content.length} chars). Strictly shorten your output to fit under 2000 characters, including all formatting, links, and spacing. Output only the shortened message.`;
                        continue;
                    }
                    try {
                        await chatBot.sendMessage(channelName, parsed.content);
                        logger?.info(`Message sent to #${channelName}`);
                        return;
                    } catch (err: unknown) {
                        // Discord API error for message too long
                        const errorObj = err as Record<string, unknown>;
                        const rawError = errorObj.rawError as Record<string, unknown> | undefined;
                        const errors = rawError?.errors as Record<string, unknown> | undefined;
                        const content = errors?.content as Record<string, unknown> | undefined;
                        const _errors = content?._errors as Array<{ code: string }> | undefined;
                        if (
                            rawError?.code === 50035 &&
                            Array.isArray(_errors) &&
                            _errors.some((e) => e.code === 'BASE_TYPE_MAX_LENGTH')
                        ) {
                            logger?.warn(
                                'Discord message too long, retrying with stricter length constraint',
                                { length: parsed.content.length },
                            );
                            userQuery = `The last message you generated was too long (${parsed.content.length} chars). Strictly shorten your output to fit under 2000 characters, including all formatting, links, and spacing. Output only the shortened message.`;
                            lastError = err;
                            continue;
                        }
                        logger?.error('Failed to send message to Discord', { err });
                        throw err;
                    }
                } else if (parsed.action === 'noop') {
                    logger?.info(parsed.reason ?? 'No reason provided for noop action');
                    return;
                } else {
                    logger?.error('Unknown agent action', { parsed });
                    return;
                }
            }
            logger?.error('Failed to send message after retries', { lastContent, lastError });
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
