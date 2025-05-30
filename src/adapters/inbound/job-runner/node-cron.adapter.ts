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
        try {
            for (const job of this.jobs) {
                // Execute immediately if configured to run on startup
                // Run in background to not block initialization
                if (job.executeOnStartup) {
                    job.execute().catch((error) => {
                        this.logger.error('Failed to execute startup job', {
                            error,
                            job: job.name,
                        });
                    });
                }

                // Schedule the job
                const task = cron.schedule(job.schedule, () => {
                    job.execute().catch((error) => {
                        this.logger.error('Failed to execute job', {
                            error,
                            job: job.name,
                        });
                    });
                });

                this.tasks.push(task);
                this.logger.info(`A new job has been scheduled: ${job.name}`, {
                    job: job.name,
                    schedule: job.schedule,
                });
            }
        } catch (error) {
            this.logger.error('Failed to initialize job runner', { error });
            throw error;
        }
    }

    public async stop(): Promise<void> {
        for (const task of this.tasks) {
            task.stop();
        }
        this.tasks = [];
    }
}
