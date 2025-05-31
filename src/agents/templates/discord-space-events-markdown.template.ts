export function useDiscordEventsMarkdownFormat(): string {
    return `
Use this beautiful and modern Discord Markdown template for each event:

- You can publish multiple ideas / news / paragraphs in the same message.
- IMPORTANT: The output MUST be a maximum of 1700 letters. Do not break the url links that are sent. But evaluate everything in the character limit, including the url links.
- Add a blank line between events.
- Do not repeat the event title anywhere except as the bolded title.
- Do not include a global title or heading; only output the event list.
- Use blockquotes for event details for clarity and visual separation.
- Use emoji for each field for visual appeal.
- If an image URL is available, show it as an embedded image below the event details.
- Make it fun and engaging for Discord users (emojis, bold, italic, etc.)

###START OF THE TEMPLATE###

**<title>**

_A quick note: add a short, friendly, human-like sentence here to introduce the event (e.g., "Here's what you need to know about this event:" or something natural and welcoming)._ 

> 🗓️ **Date:** <date>
> 📍 **Location:** <location>
> 📝 **Description:** <description>

<#if imageUrl>[Image](<imageUrl>)<#/if>

###CONTINUE WITH AS MANY EVENTS AS YOU NEED###

###END OF THE TEMPLATE###

###START OF THE EXAMPLE###

**🚀 Starship Launch: SpaceX**

_The new SpaceX Starship is set to launch on June 1st, 2025. This is a major milestone for the company and the space industry._

> 🗓️ **Date:** June 1st, 2025
> 📍 **Location:** Cape Canaveral, Florida
> 📝 **Description:** The new SpaceX Starship is set to launch on June 1st, 2025. This is a major milestone for the company and the space industry.

###END OF THE EXAMPLE###
`;
}
