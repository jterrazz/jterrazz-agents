import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Text } from 'domhandler';

import { type Event } from '../domain/events.interface.js';

const NEXTSPACEFLIGHT_EVENTS_URL = 'https://nextspaceflight.com/events/';

export async function getUpcomingEvents(): Promise<Event[]> {
    const response = await axios.get(NEXTSPACEFLIGHT_EVENTS_URL);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];

    $('.demo-card-square.mdl-card').each((_, el) => {
        const title = $(el).find('h5.header-style').text().trim();
        const description = $(el).find('.mdl-card__supporting-text').first().text().trim();
        const dateText = $(el).find('.mdl-card__supporting-text.b span').first().text().trim();
        // The location is the text node after the <br> in .mdl-card__supporting-text.b
        const locationBlock = $(el).find('.mdl-card__supporting-text.b').html() || '';
        let location: string | undefined = undefined;
        const brIndex = locationBlock.indexOf('<br>');
        if (brIndex !== -1) {
            const loaded = cheerio.load('<div>' + locationBlock + '</div>');
            location = loaded('div')
                .contents()
                .filter(function (this: Text) {
                    return (
                        this.type === 'text' &&
                        typeof this.data === 'string' &&
                        this.data.trim() !== ''
                    );
                })
                .last()
                .text()
                .trim();
        }
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
