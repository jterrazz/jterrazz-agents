import { discordHeader } from './discord.js';

export const discordNewsFormat = `
${discordHeader}
- Add a blank line between items for readability.
- If a URL or tweet link is available, show it as a clickable link below the details, wrapped in < > (e.g. <https://example.com>) to suppress Discord embeds and previews.


###START OF THE TEMPLATE###
A genuinely human, casual phrase, based on the last messages you already sent.

**<title>**

_Short, human-like summary or context sentence about why this matters._

> <summary or main point>
> <#if url><https://example.com><#/if>

###CONTINUE WITH AS MANY ITEMS AS YOU NEED###

###END OF THE TEMPLATE###

###START OF THE EXAMPLE###

Just spotted some cool stuff you might like:

**🚀 Bun 1.0 Released!**

_The new JavaScript runtime is now production-ready and much faster than Node.js in benchmarks. etc etc_

> Bun 1.0 is out, bringing a new era for JS server-side performance. etc etc
> <https://bun.sh/blog/bun-v1.0.0>


**🦀 Rust 1.75 Announced!**

_Rust continues to improve developer experience and performance with its latest release. etc etc_

> Rust 1.75 brings new language features and faster compile times. etc etc
> <https://blog.rust-lang.org/2024/01/18/Rust-1.75.0.html>

###END OF THE EXAMPLE###
`;
