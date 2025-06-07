
import { createSafeAgentTool } from '../tool.js';

import { formatDate } from './formatters/date-formatter.js';

export function createGetCurrentDateTool() {
    return createSafeAgentTool(
        {
            description:
                'Returns the current date and time in a human-readable format (e.g., "June 13, 2024 at 12:34 PM"). No input required. Always call this tool to get the current date.',
            name: 'getCurrentDate',
        },
        async () => {
            return formatDate(new Date());
        },
    );
}
