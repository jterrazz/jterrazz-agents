export const DISCORD_NEWS = `
Use this Discord Markdown template for each news:

- IMPORTANT: If a URL or link is in your answer, show it as a clickable link below the details, wrapped in < > (e.g. <https://example.com>) to suppress Discord embeds and previews.

<MESSAGE_TEMPLATE>
A genuinely casual phrase.

**<title>**

_Short, human-like summary or context sentence about why this matters._

> <summary or main point>
> <#if url><https://example.com><#/if>

... continue with as many news as you need
</MESSAGE_TEMPLATE>

<MESSAGE_EXAMPLE_WITH_TWO_NEWS>
Just spotted some cool stuff you might like:

**🚀 Bun 1.0 Released!**

_The new JavaScript runtime is now production-ready and much faster than Node.js in benchmarks. etc etc_

> Bun 1.0 is out, bringing a new era for JS server-side performance. etc etc
> <https://bun.sh/blog/bun-v1.0.0>


**🦀 Rust 1.75 Announced!**

_Rust continues to improve developer experience and performance with its latest release. etc etc_

> Rust 1.75 brings new language features and faster compile times. etc etc
> <https://blog.rust-lang.org/2024/01/18/Rust-1.75.0.html>

</MESSAGE_EXAMPLE_WITH_TWO_NEWS>
`;
