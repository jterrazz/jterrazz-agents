import axios from 'axios';
import * as cheerio from 'cheerio';

import { type Event, EventTypeEnum } from '../../../ports/outbound/events.port.js';

const NEXTSPACEFLIGHT_EVENTS_URL = 'https://nextspaceflight.com/events/';
const NEXTSPACEFLIGHT_LAUNCHES_URL = 'https://nextspaceflight.com/launches/';

export async function getUpcomingEvents(): Promise<Event[]> {
    const response = await axios.get(NEXTSPACEFLIGHT_EVENTS_URL);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];

    // Extract all <style> blocks and join their contents
    const styleBlocks = $('style')
        .map((_, el) => $(el).html() || '')
        .get()
        .join('\n');

    $('.demo-card-square.mdl-card').each((_, el) => {
        const card = $(el);
        // Find the unique class (e.g., a376)
        const classAttr = card.attr('class') || '';
        const match = classAttr.match(/a\d+/);
        const uniqueClass = match ? match[0] : '';
        let imageUrl: string | undefined = undefined;
        if (uniqueClass) {
            // Build regex to find the background-image URL for this card
            const regex = new RegExp(
                `\\.demo-card-square\\.${uniqueClass} > \\.mdl-card__title \\{[^}]*background-image: url\\(([^)]+)\\)`,
                'm',
            );
            const found = styleBlocks.match(regex);
            if (found && found[1]) {
                imageUrl = found[1];
            }
        }

        const title = card.find('h5.header-style').text().trim();
        const description = card.find('.mdl-card__supporting-text').first().text().trim();
        const dateText = card.find('.mdl-card__supporting-text.b span').first().text().trim();
        // The location is the text node after the <br> in .mdl-card__supporting-text.b
        const locationBlock = card.find('.mdl-card__supporting-text.b').html() || '';
        let location: string | undefined = undefined;
        const brIndex = locationBlock.indexOf('<br>');
        if (brIndex !== -1) {
            const loaded = cheerio.load('<div>' + locationBlock + '</div>');
            location = loaded('div')
                .contents()
                .filter(
                    (_, el) =>
                        el.type === 'text' && typeof el.data === 'string' && el.data.trim() !== '',
                )
                .last()
                .text()
                .trim();
        }
        const date = new Date(dateText);
        if (title && !isNaN(date.getTime())) {
            events.push({
                date,
                description: description || undefined,
                eventType: EventTypeEnum.SpaceMission,
                imageUrl,
                location: location || undefined,
                sourceUrl: NEXTSPACEFLIGHT_EVENTS_URL,
                title,
            });
        }
    });

    return events;
}

export async function getUpcomingRocketLaunches(): Promise<Event[]> {
    const response = await axios.get(NEXTSPACEFLIGHT_LAUNCHES_URL);
    const $ = cheerio.load(response.data);
    const events: Event[] = [];

    // Extract all <style> blocks and join their contents
    const styleBlocks = $('style')
        .map((_, el) => $(el).html() || '')
        .get()
        .join('\n');

    $('.launch.mdl-card').each((_, el) => {
        const card = $(el);
        // Find the unique class (e.g., a6956)
        const classAttr = card.attr('class') || '';
        const match = classAttr.match(/a\d+/);
        const uniqueClass = match ? match[0] : '';
        let imageUrl: string | undefined = undefined;
        if (uniqueClass) {
            // Build regex to find the background-image URL for this card
            const regex = new RegExp(
                `\\.launch\\.${uniqueClass} > \\.mdl-card__title \\{[^}]*background: url\\(([^)]+)\\)`,
                'm',
            );
            const found = styleBlocks.match(regex);
            if (found && found[1]) {
                imageUrl = found[1];
            }
        }

        const agency = card.find('.mdl-card__title-text span').first().text().trim();
        const title = card.find('h5.header-style').text().trim();
        // Date is the first span in .mdl-card__supporting-text
        const dateText = card.find('.mdl-card__supporting-text span').first().text().trim();
        // Location is the text node after <br> in .mdl-card__supporting-text
        const locationBlock = card.find('.mdl-card__supporting-text').html() || '';
        let location: string | undefined = undefined;
        const brIndex = locationBlock.indexOf('<br>');
        if (brIndex !== -1) {
            const loaded = cheerio.load('<div>' + locationBlock + '</div>');
            location = loaded('div')
                .contents()
                .filter(
                    (_, el) =>
                        el.type === 'text' && typeof el.data === 'string' && el.data.trim() !== '',
                )
                .last()
                .text()
                .trim();
        }
        // Details URL
        let detailsUrl: string | undefined = undefined;
        card.find('a.mdc-button').each((_, a) => {
            const btn = $(a);
            if (btn.text().toLowerCase().includes('details')) {
                detailsUrl = btn.attr('href');
                if (detailsUrl && !detailsUrl.startsWith('http')) {
                    detailsUrl = 'https://nextspaceflight.com' + detailsUrl;
                }
            }
        });
        const date = new Date(dateText);
        if (title && !isNaN(date.getTime())) {
            events.push({
                date,
                description: agency || undefined,
                eventType: EventTypeEnum.RocketLaunch,
                imageUrl,
                location: location || undefined,
                sourceUrl: detailsUrl || NEXTSPACEFLIGHT_LAUNCHES_URL,
                title,
            });
        }
    });

    return events;
}
