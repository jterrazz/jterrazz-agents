export function useDiscordNewsMarkdownFormat(): string {
    return `
Use this clear and modern Discord Markdown template for each item:

**<headline>**

_Short, human-like summary or context sentence about why this news matters._

> <summary or main point>
> [Read more](<url>)

- Add a blank line between items for readability.
- Do not repeat the headline anywhere except as the bolded title.
- Do not include a global title or heading; only output the news list.
- If a URL is available, show it as a link below the details.
`;
}
