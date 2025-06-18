import axios from 'axios';
import * as cheerio from 'cheerio';

import { type Event, EventTypeEnum } from '../../../ports/outbound/providers/events.port.js';

const TECHMEME_EVENTS_URL = 'https://www.techmeme.com/events';
const TECHMEME_BASE_URL = 'https://www.techmeme.com';

export async function getUpcomingTechEvents(): Promise<Event[]> {
    const response = await axios.get(TECHMEME_EVENTS_URL);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];

    // Each event is in a .rhov > a
    $('.rhov > a').each((_, el) => {
        const anchor = $(el);
        const divs = anchor.find('div');
        const dateText = divs.eq(0).text().trim();
        const title = divs.eq(1).text().trim();
        const location = divs.eq(2).text().trim() || undefined;
        let sourceUrl = anchor.attr('href') || TECHMEME_EVENTS_URL;
        if (sourceUrl && !sourceUrl.startsWith('http')) {
            sourceUrl = TECHMEME_BASE_URL + sourceUrl;
        }
        // Parse the first date in the string (e.g., "May 27-30" or "Jun 10-12, 2024")
        let date: Date | undefined = undefined;
        if (dateText) {
            // Try to find a year, otherwise use current year
            const yearMatch = dateText.match(/\d{4}/);
            const year = yearMatch ? yearMatch[0] : new Date().getFullYear();
            // Try to find the first month and day
            const mdMatch = dateText.match(/([A-Za-z]+) (\d{1,2})/);
            if (mdMatch) {
                const month = mdMatch[1];
                const day = mdMatch[2];
                date = new Date(`${month} ${day}, ${year}`);
            }
        }
        if (title && date && !isNaN(date.getTime())) {
            events.push({
                date,
                description: undefined,
                eventType: EventTypeEnum.Conference,
                imageUrl: undefined,
                location,
                sourceUrl,
                title,
            });
        }
    });

    return events;
}
