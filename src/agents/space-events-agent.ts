import type { LoggerPort } from '@jterrazz/logger';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { extractJson, isAgentResponse } from './utils.js';

import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';
import { createFetchSpaceEventsTool } from './tools/fetch-space-events.tool.js';
import { createWebSearchTool } from './tools/web-search.tool.js';

export function createSpaceEventsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
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

When listing upcoming space events, use this beautiful and modern Discord Markdown template for each event:

**<title>**
> 🗓️ **Date:** <date>
> 📍 **Location:** <location>
> 📝 **Description:** <description>
> <#if imageUrl>![image](<imageUrl>)<#/if>

- Add a blank line between events.
- Do not repeat the event title anywhere except as the bolded title.
- Do not include a global title or heading; only output the event list.
- Use blockquotes for event details for clarity and visual separation.
- Use emoji for each field for visual appeal.
- If an image URL is available, show it as an embedded image below the event details.
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
                    });
                })();
            }
            const executor = await executorPromise;
            const result = await executor.invoke({ input: userQuery });
            const parsed = extractJson(result.output);
            if (!isAgentResponse(parsed)) {
                logger.error('Agent response is not valid JSON', { output: result.output });
                return;
            }
            if (parsed.action === 'post' && parsed.content) {
                await chatBot.sendMessage(channelName, parsed.content);
                logger.info(`Résumé des événements envoyé sur #${channelName}`);
            } else if (parsed.action === 'noop') {
                logger.info(parsed.reason ?? 'No reason provided for noop action');
            } else {
                logger.error('Unknown agent action', { parsed });
            }
        },
    };
}
