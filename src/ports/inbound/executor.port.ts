/**
 * Executor port - defines how background tasks can be scheduled and managed
 */
export interface ExecutorPort {
    /**
     * Initialize the executor and start all registered tasks
     */
    initialize(): Promise<void>;

    /**
     * Stop all scheduled tasks
     */
    stop(): Promise<void>;
}

/**
 * Represents a task that can be scheduled and executed
 */
export interface TaskPort {
    /**
     * The function to execute when the task runs
     */
    execute: () => Promise<void>;

    /**
     * Whether the task should be executed immediately on startup
     * @default false
     */
    executeOnStartup?: boolean;

    /**
     * Unique name of the task
     */
    name: string;

    /**
     * Cron expression defining when the task should run
     */
    schedule: string;
}
