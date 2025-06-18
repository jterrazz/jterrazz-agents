import { SafeToolAdapter, type ToolPort } from '@jterrazz/intelligence';
import { type LoggerPort } from '@jterrazz/logger';

import { formatDate } from './formatters/date-formatter.js';

const TOOL_NAME = 'getCurrentDate';

const TOOL_DESCRIPTION = `
Returns the current date and time in a human-readable format (e.g., "June 13, 2024 at 12:34 PM").
No input required. Always call this tool to get the current date.
`.trim();

export function createGetCurrentDateTool(logger: LoggerPort): ToolPort {
    async function getCurrentDate(): Promise<string> {
        logger.info('Executing getCurrentDate tool...');

        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);

        logger.info('Returning current date.', { date: formattedDate });

        return formattedDate;
    }

    return new SafeToolAdapter(
        {
            description: TOOL_DESCRIPTION,
            execute: getCurrentDate,
            name: TOOL_NAME,
        },
        {
            logger,
        },
    );
}
