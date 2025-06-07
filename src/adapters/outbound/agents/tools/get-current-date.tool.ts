import { DynamicTool } from 'langchain/tools';

export function createGetCurrentDateTool() {
    return new DynamicTool({
        description:
            'Returns the current date and time in ISO 8601 format (e.g., 2024-06-13T12:34:56.789Z). No input required.',
        func: async () => {
            return new Date().toISOString();
        },
        name: 'getCurrentDate',
    });
}

export function withGetCurrentDateTool() {
    return 'Use the getCurrentDate tool to get the current date.';
}
