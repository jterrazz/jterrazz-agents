import type { LoggerPort } from '@jterrazz/logger';

import type { ChatBotPort } from '../ports/outbound/chatbot.port.js';

import { createChatAgent } from './base/chat-agent-factory.js';
import { buildSystemPrompt } from './base/prompt-rules.js';
import { createFetchFinancialTweetsTool } from './tools/fetch-financial-tweets.tool.js';
import { createFetchRecentBotMessagesTool } from './tools/fetch-recent-bot-messages.tool.js';

export function createInvestNewsAgent({
    channelName,
    chatBot,
    logger,
}: {
    channelName: string;
    chatBot: ChatBotPort;
    logger: LoggerPort;
}) {
    const agentSpecific = `
Summarize the latest important financial news and tweets relevant to investors.
Use the fetchFinancialTweets tool to get the latest tweets from financial experts.

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
`;
    const agent = createChatAgent({
        logger,
        modelConfig: undefined,
        promptTemplate: [
            ['system', buildSystemPrompt(agentSpecific)],
            ['human', '{input}'],
        ],
        tools: [
            createFetchRecentBotMessagesTool({ channelName, chatBot }),
            createFetchFinancialTweetsTool(),
        ],
    });
    return agent;
}
