import { describe, test } from '@jterrazz/test';

import { getUpcomingTechEvents } from '../techmeme-events.adapter.js';

describe('getUpcomingTechEvents', () => {
    test('it should log the output of upcoming tech events', async () => {
        // Given - the Techmeme events page is available

        // When - fetching upcoming tech events
        const events = await getUpcomingTechEvents();

        // Then - log the events for inspection
        console.log(JSON.stringify(events, null, 2));
    });
});
