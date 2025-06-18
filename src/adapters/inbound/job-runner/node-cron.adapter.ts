import { type LoggerPort } from '@jterrazz/logger';
import cron, { type ScheduledTask } from 'node-cron';

import { type Job, type JobRunnerPort } from '../../../ports/inbound/job-runner.port.js';

export class NodeCronAdapter implements JobRunnerPort {
    private tasks: ScheduledTask[] = [];

    constructor(
        private readonly logger: LoggerPort,
        public readonly jobs: Job[],
    ) {}

    public async initialize(): Promise<void> {
        this.logger.info('Initializing job runner...');

        if (this.jobs.length > 0) {
            this.logger.info(`Scheduling jobs: ${this.jobs.map((job) => job.name).join(', ')}`);
        } else {
            this.logger.info('No jobs to schedule.');
        }

        try {
            for (const job of this.jobs) {
                // Execute immediately if configured to run on startup
                // Run in background to not block initialization
                if (job.executeOnStartup) {
                    this.logger.debug(`Executing job on startup: ${job.name}`);
                    job.execute().catch((error) => {
                        this.logger.error(`Startup job execution failed: ${job.name}`, {
                            error,
                            job: job.name,
                        });
                    });
                }

                // Schedule the job
                const task = cron.schedule(job.schedule, () => {
                    job.execute().catch((error) => {
                        this.logger.error(`Scheduled job execution failed: ${job.name}`, {
                            error,
                            job: job.name,
                        });
                    });
                });

                this.tasks.push(task);
                this.logger.debug(`Job scheduled: ${job.name}`, {
                    job: job.name,
                    schedule: job.schedule,
                });
            }

            this.logger.info('Job runner initialized successfully');
        } catch (error) {
            this.logger.error('Job runner initialization failed', { error });
            throw error;
        }
    }

    public async stop(): Promise<void> {
        this.logger.info('Stopping all scheduled jobs...');

        for (const task of this.tasks) {
            task.stop();
        }
        this.tasks = [];

        this.logger.info('All scheduled jobs stopped');
    }
}
