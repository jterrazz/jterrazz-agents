import type { LoggerPort } from '@jterrazz/logger';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { tool } from '@langchain/core/tools';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createStructuredChatAgent } from 'langchain/agents';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createNitterTwitterAdapter } from '../adapters/outbound/web-scraper/nitter-twitter.adapter.js';

import { extractJson, isAgentResponse } from './utils.js';

import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';

// You can add tools for fetching Twitter/Nitter news here
// import { createFetchInvestNewsTool } from './tools/fetch-invest-news.tool.js';

export function createInvestAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const fetchRecentBotMessagesTool = createFetchRecentBotMessagesTool({ channelName, chatBot });
    const fetchFinancialTweetsTool = createFetchFinancialTweetsTool();
    // Placeholder for future tools
    // const fetchInvestNewsTool = createFetchInvestNewsTool();
    const model = new ChatGoogleGenerativeAI({
        maxOutputTokens: 10_000,
        model: 'gemini-2.5-flash-preview-05-20',
    });
    const prompt = ChatPromptTemplate.fromMessages([
        [
            'system',
            `You are a helpful assistant in a Discord chat for the #invest channel. You should behave like a real person:
- Summarize the latest important financial news and tweets relevant to investors.
- Never repeat already sent news, even if the wording or formatting changes. Always check recent bot messages to avoid duplicates.
- If there is nothing new or relevant to add, do not post anything.
- Use the getRecentBotMessages tool to see what you (the bot) have recently posted.
- Use the fetchFinancialTweets tool to get the latest tweets from financial experts.
- If you decide not to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "noop", "reason": "<your reason>" }} }}\n\u0060\u0060\u0060.
- If you decide to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "post", "content": "<the message to post>" }} }}\n\u0060\u0060\u0060.
- For tool calls, use: \u0060\u0060\u0060json\n{{ "action": <tool_name>, "action_input": <tool_input> }}\n\u0060\u0060\u0060.
- **Always output ONLY a valid JSON object. Do not include any code block, explanation, or formatting—just the JSON.**

When listing news or tweets, use this clear and modern Discord Markdown template for each item:

**<headline>**

_Short, human-like summary or context sentence about why this news matters._

> <summary or main point>
>
> [Read more](<url>)

- Add a blank line between items for readability.
- Do not repeat the headline anywhere except as the bolded title.
- Do not include a global title or heading; only output the news list.
- Use blockquotes for details for clarity and visual separation.
- If a URL is available, show it as a link below the details.
- The output must be a maximum of 2000 characters (Discord message limit).
- Keep the output concise, readable, and visually clear for the #invest channel.

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
                        tools: [fetchRecentBotMessagesTool, fetchFinancialTweetsTool],
                    });
                    return AgentExecutor.fromAgentAndTools({
                        agent,
                        tools: [fetchRecentBotMessagesTool, fetchFinancialTweetsTool],
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
                logger.info(`Résumé des actualités envoyé sur #${channelName}`);
            } else if (parsed.action === 'noop') {
                logger.info(parsed.reason ?? 'No reason provided for noop action');
            } else {
                logger.error('Unknown agent action', { parsed });
            }
        },
    };
}

function createFetchFinancialTweetsTool() {
    const nitter = createNitterTwitterAdapter();
    return tool(
        async (input: string) => {
            // input: JSON string { username: string, limit?: number }
            let username = 'KobeissiLetter';
            let limit = 5;
            try {
                if (input) {
                    const parsed = JSON.parse(input);
                    if (parsed.username) username = parsed.username;
                    if (parsed.limit) limit = parsed.limit;
                }
            } catch {}
            const tweets = await nitter.fetchLatestMessages(username, limit);
            return JSON.stringify(tweets);
        },
        {
            description:
                'Fetches latest financial tweets from a Nitter user. Input: { username: string, limit?: number }',
            name: 'fetchFinancialTweets',
        },
    );
}
