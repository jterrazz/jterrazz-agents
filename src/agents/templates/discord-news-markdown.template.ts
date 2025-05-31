export function withDiscordNewsMarkdownFormat(): string {
    return `
Use this clear and modern Discord Markdown template for each item.
You can publish multiple ideas / news / paragraphs in the same message.

Start the message with a genuinely human, casual intro phrase (e.g. a greeting or friendly opener) ONLY if you have NOT already greeted or used an intro in the last few messages. If you recently greeted, do an intro but without the greeting.

**<title>**

_Short, human-like summary or context sentence about why this matters._

> <summary or main point>
> <#if url><https://example.com><#/if>

- Add a blank line between items for readability.
- Do not repeat the title anywhere except as the bolded title.
- Do not include a global title or heading; only output the news list.
- If a URL or tweet link is available, show it as a clickable link below the details, wrapped in < > (e.g. <https://example.com>) to suppress Discord embeds and previews.

**Example for the structure:**

(If you haven't greeted recently:)
Hey people, just spotted some cool stuff you might like:

**🚀 Bun 1.0 Released!**

_The new JavaScript runtime is now production-ready and much faster than Node.js in benchmarks. etc etc_

> Bun 1.0 is out, bringing a new era for JS server-side performance. etc etc
> <https://bun.sh/blog/bun-v1.0.0>


**🦀 Rust 1.75 Announced!**

_Rust continues to improve developer experience and performance with its latest release. etc etc_

> Rust 1.75 brings new language features and faster compile times. etc etc
> <https://blog.rust-lang.org/2024/01/18/Rust-1.75.0.html>

IMPORTANT: The output MUST be a maximum of 1700 letters. 
Do not break the url links that are sent. But evaluate everything in the character limit, including the url links.
Respect the spacing and the line breaks.
Make it fun and engaging for Discord users (emojis, bold, italic, etc.)
`;
}
