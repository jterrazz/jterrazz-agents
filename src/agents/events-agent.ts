import { ChatPromptTemplate } from '@langchain/core/prompts';
import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

import { getRecentBotMessages } from '../infrastructure/discord-messages.service.js';
import { getUpcomingEvents } from '../infrastructure/nextspaceflight-events.service.js';
import { searchWeb } from '../infrastructure/websearch.service.js';

import { channelName, client } from '../index.js';

const fetchEventsTool = tool(
    async (_input: string) => {
        return JSON.stringify(await getUpcomingEvents());
    },
    {
        description: 'Fetches upcoming space events.',
        name: 'getUpcomingEvents',
    },
);

const webSearchTool = tool(
    async (input: string) => {
        return JSON.stringify(await searchWeb(input));
    },
    {
        description: 'Performs a web search for up-to-date information.',
        name: 'searchWeb',
    },
);

const fetchRecentBotMessagesTool = tool(
    async (_input: string) => {
        // Fetch the last 10 bot messages from the #space channel
        return JSON.stringify(await getRecentBotMessages({ channelName, client, limit: 10 }));
    },
    {
        description: 'Fetches the most recent messages sent by the bot in the #space channel.',
        name: 'getRecentBotMessages',
    },
);

const model = new ChatGoogleGenerativeAI({
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

export async function runEventsAgent(userQuery: string): Promise<string> {
    if (!executorPromise) {
        executorPromise = (async () => {
            const agent = await createStructuredChatAgent({
                llm: model,
                prompt,
                tools: [fetchEventsTool, webSearchTool, fetchRecentBotMessagesTool],
            });
            return AgentExecutor.fromAgentAndTools({
                agent,
                tools: [fetchEventsTool, webSearchTool, fetchRecentBotMessagesTool],
                verbose: true,
            });
        })();
    }
    const executor = await executorPromise;
    const result = await executor.invoke({ input: userQuery });
    return result.output;
}
