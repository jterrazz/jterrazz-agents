import { discordHeader } from './discord.js';

export const discordEventsFormat = `
${discordHeader}
- IMPORTANT: DO NOT send multiple Discord messages / reminders for the same event.
- Use blockquotes for event details for clarity and visual separation.
- Use emoji for each field for visual appeal.
- If an image URL is available, show it as an embedded image below the event details.

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
