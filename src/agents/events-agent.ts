import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import {
    createFetchRecentBotMessagesTool,
    createFetchSpaceEventsTool,
    createWebSearchTool,
} from './tools.js';

export function createEventsAgent({
    channelName,
    chatBot,
}: {
    channelName: string;
    chatBot: ChatBotPort;
}) {
    const fetchRecentBotMessagesTool = createFetchRecentBotMessagesTool({ channelName, chatBot });
    const fetchSpaceEventsTool = createFetchSpaceEventsTool();
    const webSearchTool = createWebSearchTool();
    const model = new ChatGoogleGenerativeAI({
        maxOutputTokens: 10_000,
        model: 'gemini-2.5-flash-preview-05-20',
        streaming: false,
    });
    const prompt = ChatPromptTemplate.fromMessages([
        [
            'system',
            `You are a helpful assistant in a Discord chat. You should behave like a real person:
- Do not post the same information twice, even if the wording is slightly different.
- If there is nothing new or relevant to add, do not post anything.
- Use the getRecentBotMessages tool to see what you (the bot) have recently posted.
- If you decide not to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "noop", "reason": "<your reason>" }} }}\n\u0060\u0060\u0060.
- If you decide to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "post", "content": "<the message to post>" }} }}\n\u0060\u0060\u0060.
- For tool calls, use: \u0060\u0060\u0060json\n{{ "action": <tool_name>, "action_input": <tool_input> }}\n\u0060\u0060\u0060.
- **Always output ONLY a valid JSON object, inside a markdown code block (begin with three backticks and 'json', and end with three backticks). Do not include any explanation, code block, or formatting—just the JSON in the code block.**

When listing upcoming space events, format your output for Discord using Markdown. For each event:
- Use a bullet point (•) at the start.
- Bold the event title.
- On the next lines, show:
  📅 Date: <date>
  📍 Location: <location>
  📝 Description: <description>
- If an image URL is available, add a new line with: [Image](<imageUrl>)
- Add a blank line between events.
- Do not repeat the event title anywhere except as the bolded title.
- Do not include a global title or heading; only output the event list.
- Keep the output concise and visually clear for the #space channel.

You have access to the following tools:
{tools}
Tool names: {tool_names}
Use the tools as needed to answer the user's question.

{agent_scratchpad}
`,
        ],
        ['human', '{input}'],
    ]);
    let executorPromise: null | Promise<AgentExecutor> = null;
    return {
        async run(userQuery: string, chatBot: ChatBotPort, channelName: string): Promise<void> {
            if (!executorPromise) {
                executorPromise = (async () => {
                    const agent = await createStructuredChatAgent({
                        llm: model,
                        prompt,
                        tools: [fetchSpaceEventsTool, webSearchTool, fetchRecentBotMessagesTool],
                    });
                    return AgentExecutor.fromAgentAndTools({
                        agent,
                        tools: [fetchSpaceEventsTool, webSearchTool, fetchRecentBotMessagesTool],
                        verbose: true,
                    });
                })();
            }
            const executor = await executorPromise;
            const result = await executor.invoke({ input: userQuery });
            const parsed = extractJson(result.output);
            if (!isAgentResponse(parsed)) {
                console.error('Agent response is not valid JSON:', result.output);
                return;
            }
            if (parsed.action === 'post' && parsed.content) {
                await chatBot.sendMessage(channelName, parsed.content);
                console.log(`Résumé des événements envoyé sur #${channelName}`);
            } else if (parsed.action === 'noop') {
                console.log(parsed.reason);
            } else {
                console.error('Unknown agent action:', parsed);
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
