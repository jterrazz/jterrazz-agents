import { ChatPromptTemplate } from '@langchain/core/prompts';
import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

import { getUpcomingEvents } from '../infrastructure/nextspaceflight-events.service.js';
import { searchWeb } from '../infrastructure/websearch.service.js';

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

const model = new ChatGoogleGenerativeAI({
    maxOutputTokens: 2048,
    model: 'gemini-2.5-flash-preview-05-20',
    streaming: false,
});

const prompt = ChatPromptTemplate.fromMessages([
    [
        'system',
        `You are a helpful assistant for a Discord chat. When listing upcoming space events, format your output for Discord using Markdown. For each event:
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
                tools: [fetchEventsTool, webSearchTool],
            });
            return AgentExecutor.fromAgentAndTools({
                agent,
                tools: [fetchEventsTool, webSearchTool],
                verbose: true,
            });
        })();
    }
    const executor = await executorPromise;
    const result = await executor.invoke({ input: userQuery });
    return result.output;
}
