import { type LoggerPort } from '@jterrazz/logger';
import { DynamicTool } from 'langchain/tools';

import { type AgentToolPort } from '../../../../ports/outbound/agents.port.js';

export type ToolConfig = {
    description: string;
    name: string;
};

export type ToolFunction = () => Promise<string>;

export function createSafeAgentTool(
    config: ToolConfig,
    toolFunction: ToolFunction,
    logger?: LoggerPort,
): AgentToolPort {
    return new DynamicTool({
        description: config.description,
        func: async () => {
            try {
                return await toolFunction();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);

                logger?.error(`Unexpected error in ${config.name}`, {
                    error: errorMessage,
                    toolName: config.name,
                });

                return `Unable to fetch data at this time. Please try again later.`;
            }
        },
        name: config.name,
    });
}
