export function useDiscordNewsMarkdownFormat(): string {
    return `
Use this clear and modern Discord Markdown template for each item.
You can publish multiple ideas / news / paragraphs in the same message.

**<title>**

_Short, human-like summary or context sentence about why this matters._

> <summary or main point>
> <#if url>[Read more](<url>)<#/if>

- Add a blank line between items for readability.
- Do not repeat the title anywhere except as the bolded title.
- Do not include a global title or heading; only output the news list.
- If a URL or tweet link is available, show it as a link below the details as a read more link.

The output MUST be a maximum of 1500 characters (Discord message limit).
Make it fun and engaging for Discord users (emojis, bold, italic, etc.)
`;
}
