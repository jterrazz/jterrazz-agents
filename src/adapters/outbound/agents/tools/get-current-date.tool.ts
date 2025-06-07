import { DynamicTool } from 'langchain/tools';

import { formatDate } from './formatters/date-formatter.js';

export function createGetCurrentDateTool() {
    return new DynamicTool({
        description:
            'Returns the current date and time in a human-readable format (e.g., "June 13, 2024 at 12:34 PM"). No input required. Always call this tool to get the current date.',
        func: async () => {
            return formatDate(new Date());
        },
        name: 'getCurrentDate',
    });
}
