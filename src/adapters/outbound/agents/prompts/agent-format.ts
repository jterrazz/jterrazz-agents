import { discordEventsFormat } from './formats/discord-events-format.js';
import { discordNewsFormat } from './formats/discord-news-format.js';

export const agentFormat = {
    discordEvents: discordEventsFormat,
    discordNews: discordNewsFormat,
};
