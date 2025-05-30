export function useDiscordNewsMarkdownFormat(): string {
    return `
Use this clear and modern Discord Markdown template for each item. This format is for both news and a mix of what your sources are thinking or discussing on the relevant subject—not just strict news, but also more relaxed or opinionated takes.

**<headline>**

_Short, human-like summary or context sentence about why this news matters._

> <summary or main point>
> <#if url>[Read more](<url>)<#/if>

- Add a blank line between items for readability.
- Do not repeat the headline anywhere except as the bolded title.
- Do not include a global title or heading; only output the news list.
- If a URL is available, show it as a link below the details.

The output must be a maximum of 1500 characters (Discord message limit).
Make it fun and engaging for Discord users (emojis, bold, italic, etc.)
`;
}
