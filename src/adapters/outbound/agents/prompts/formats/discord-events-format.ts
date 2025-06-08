import { discordHeader } from './discord.js';

export const discordEventsFormat = `
${discordHeader}

Use this Discord Markdown template for each event:

<MESSAGE_TEMPLATE>
**<title>**

_A quick note: add a short, friendly, human-like sentence here to introduce the event (e.g., "Here's what you need to know about this event:" or something natural and welcoming)._ 

> 🗓️ **Date:** <date>
> 📍 **Location:** <location>
> 📝 **Description:** <description>

<#if imageUrl>[Image](<imageUrl>)<#/if>

... continue with as many events as you need
</MESSAGE_TEMPLATE>

<MESSAGE_EXAMPLE_WITH_ONE_EVENT>
**🚀 Starship Launch: SpaceX**

_The new SpaceX Starship is set to launch on June 1st, 2025. This is a major milestone for the company and the space industry._

> 🗓️ **Date:** June 1st, 2025
> 📍 **Location:** Cape Canaveral, Florida
> 📝 **Description:** The new SpaceX Starship is set to launch on June 1st, 2025. This is a major milestone for the company and the space industry.
</MESSAGE_EXAMPLE_WITH_ONE_EVENT>
`;
