import axios from 'axios';
import * as cheerio from 'cheerio';

import { type Event } from '../domain/events.interface.js';

const NEXTSPACEFLIGHT_EVENTS_URL = 'https://nextspaceflight.com/events/';

export async function getUpcomingEvents(): Promise<Event[]> {
    const response = await axios.get(NEXTSPACEFLIGHT_EVENTS_URL);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];

    $('.event').each((_, el) => {
        const title = $(el).find('.title').text().trim();
        const dateText = $(el).find('.date').text().trim();
        const location = $(el).find('.location').text().trim();
        const description = $(el).find('.description').text().trim();
        const date = new Date(dateText);
        if (title && !isNaN(date.getTime())) {
            events.push({
                date,
                description: description || undefined,
                location: location || undefined,
                sourceUrl: NEXTSPACEFLIGHT_EVENTS_URL,
                title,
            });
        }
    });

    return events;
}
