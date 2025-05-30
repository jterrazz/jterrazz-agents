export function useDiscordEventsMarkdownFormat(): string {
    return `
Use this beautiful and modern Discord Markdown template for each event:

**<title>**

_A quick note: add a short, friendly, human-like sentence here to introduce the event (e.g., "Here's what you need to know about this event:" or something natural and welcoming)._ 

> 🗓️ **Date:** <date>
> 📍 **Location:** <location>
> 📝 **Description:** <description>

<#if imageUrl>[O](<imageUrl>)<#/if>

- Add a blank line between events.
- Do not repeat the event title anywhere except as the bolded title.
- Do not include a global title or heading; only output the event list.
- Use blockquotes for event details for clarity and visual separation.
- Use emoji for each field for visual appeal.
- If an image URL is available, show it as an embedded image below the event details.

The output must be a maximum of 1500 characters (Discord message limit).
Make it fun and engaging for Discord users (emojis, bold, italic, etc.)
`;
} 