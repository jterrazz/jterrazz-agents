import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './factories/chat-agent-factory.js';
import { createFetchCryptoTweetsTool } from './tools/fetch-crypto-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';

export function createCryptoNewsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    return createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            [
                'system',
                `You are a helpful assistant in a Discord chat for the #crypto channel. You should behave like a real person:
- Only post about important news or technical updates related to Bitcoin, Ethereum, or generic crypto topics (including dev/tech news).
- Fetch the latest tweets from @pete_rizzo_, @cz_binance, and @VitalikButerin using the fetchCryptoTweets tool.
- Never repeat already sent news, even if the wording or formatting changes. Always check recent bot messages to avoid duplicates.
- If there is nothing new or relevant to add, do not post anything.
- Use the getRecentBotMessages tool to see what you (the bot) have recently posted.
- Use the fetchCryptoTweets tool to get the latest tweets from the specified crypto experts.
- If you decide not to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "noop", "reason": "<your reason>" }} }}\n\u0060\u0060\u0060.
- If you decide to post, respond with a JSON object: \u0060\u0060\u0060json\n{{ "action": "Final Answer", "action_input": {{ "action": "post", "content": "<the message to post>" }} }}\n\u0060\u0060\u0060.
- For tool calls, use: \u0060\u0060\u0060json\n{{ "action": <tool_name>, "action_input": <tool_input> }}\n\u0060\u0060\u0060.
- **Always output ONLY a valid JSON object. Do not include any code block, explanation, or formatting—just the JSON.**

When listing crypto news or tweets, use this clear and modern Discord Markdown template for each item:

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
- The output must be a maximum of 1500 characters (for Discord safety). If your answer is longer, summarize or trim it to fit.
- Only include the most essential and impactful news—skip anything that is not highly relevant.
- Keep the output concise, readable, and visually clear for the #crypto channel.

You have access to the following tools:
{tools}
Tool names: {tool_names}
Use the tools as needed to answer the user's question.

{agent_scratchpad}
`,
            ],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchCryptoTweetsTool(),
        ],
    });
}
