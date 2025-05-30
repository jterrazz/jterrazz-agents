export function useDiscordNewsMarkdownFormat(): string {
    return `
Use this clear and modern Discord Markdown template for each item.
You can publish multiple ideas / news / paragraphs in the same message.

Start the message with a genuinely human, casual intro phrase (e.g. "Hey guys, just spotted some cool stuff you might like:" or "Quick news drop for you all:").

**<title>**

_Short, human-like summary or context sentence about why this matters._

> <summary or main point>
> <#if url><https://example.com><#/if>

- Add a blank line between items for readability.
- Do not repeat the title anywhere except as the bolded title.
- Do not include a global title or heading; only output the news list.
- If a URL or tweet link is available, show it as a clickable link below the details, wrapped in < > (e.g. <https://example.com>) to suppress Discord embeds and previews.

**Example:**

Hey people, just spotted some cool stuff you might like:

**🚀 Bun 1.0 Released!**

_The new JavaScript runtime is now production-ready and much faster than Node.js in benchmarks. etc etc_

> Bun 1.0 is out, bringing a new era for JS server-side performance. etc etc
> <https://bun.sh/blog/bun-v1.0.0>


**🦀 Rust 1.75 Announced!**

_Rust continues to improve developer experience and performance with its latest release. etc etc_

> Rust 1.75 brings new language features and faster compile times. etc etc
> <https://blog.rust-lang.org/2024/01/18/Rust-1.75.0.html>

IMPORTANT: The output MUST be a maximum of 1700 characters. Do not break the url links that are sent. But count everything in the character limit.
Respect the spacing and the line breaks.
Make it fun and engaging for Discord users (emojis, bold, italic, etc.)
`;
}
