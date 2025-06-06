import type { LoggerPort } from '@jterrazz/logger';

import { createXAdapter } from '../../adapters/outbound/web-scraper/x.adapter.js';

import { type Tool } from '../base/tool.js';

export const createFetchTechnologyEventsTool = (logger: LoggerPort): Tool => ({
    description: 'Fetch technology events from X',
    name: 'fetch-technology-events',
    parameters: {
        properties: {},
        required: [],
        type: 'object',
    },
    run: async () => {
        const xAdapter = createXAdapter(logger);
        const events = await xAdapter.fetchTechnologyEvents();
        return events;
    },
});

export const withFetchTechnologyEventsTool = () => ({
    description: 'Fetch technology events from X',
    name: 'fetch-technology-events',
    parameters: {
        properties: {},
        required: [],
        type: 'object',
    },
});
