/**
 * Represents a job that can be scheduled and executed
 */
export interface Job {
    /**
     * The function to execute when the job runs
     */
    execute: () => Promise<void>;

    /**
     * Whether the job should be executed immediately on startup
     * @default false
     */
    executeOnStartup?: boolean;

    /**
     * Unique name of the job
     */
    name: string;

    /**
     * Cron expression defining when the job should run
     */
    schedule: string;
}

/**
 * JobRunner port - defines how background jobs can be scheduled and managed
 */
export interface JobRunnerPort {
    /**
     * Initialize the job runner and start all registered jobs
     */
    initialize(): Promise<void>;

    /**
     * Stop all scheduled jobs
     */
    stop(): Promise<void>;
}
