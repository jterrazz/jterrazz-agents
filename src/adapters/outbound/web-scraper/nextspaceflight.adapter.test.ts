import { describe, test } from '@jterrazz/test';

import { getUpcomingRocketLaunches } from './nextspaceflight.adapter.js';

// Unit test for getUpcomingRocketLaunches

describe('getUpcomingRocketLaunches', () => {
    test('it should log the output of upcoming rocket launches', async () => {
        // Given - the NextSpaceFlight rocket launches page is available

        // When - fetching upcoming rocket launches
        const launches = await getUpcomingRocketLaunches();

        // Then - log the launches for inspection

        console.log(JSON.stringify(launches, null, 2));
    });
});
