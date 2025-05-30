import { tool } from '@langchain/core/tools';

export function createGetCurrentDateTool() {
    return tool(
        async () => {
            return new Date().toISOString();
        },
        {
            description:
                'Returns the current date and time in ISO 8601 format (e.g., 2024-06-13T12:34:56.789Z). No input required.',
            name: 'getCurrentDate',
        },
    );
}
