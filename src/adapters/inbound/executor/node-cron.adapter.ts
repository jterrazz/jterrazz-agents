import { type LoggerPort } from '@jterrazz/logger';
import cron, { type ScheduledTask } from 'node-cron';

import { type ExecutorPort, type TaskPort } from '../../../ports/inbound/executor.port.js';

export class NodeCronAdapter implements ExecutorPort {
    private tasks: ScheduledTask[] = [];

    constructor(
        private readonly logger: LoggerPort,
        public readonly taskDefinitions: TaskPort[],
    ) {}

    public async initialize(): Promise<void> {
        this.logger.info('Initializing executor...');

        if (this.taskDefinitions.length > 0) {
            this.logger.info(
                `Scheduling tasks: ${this.taskDefinitions.map((task) => task.name).join(', ')}`,
            );
        } else {
            this.logger.info('No tasks to schedule.');
        }

        try {
            for (const taskDef of this.taskDefinitions) {
                // Execute immediately if configured to run on startup
                // Run in background to not block initialization
                if (taskDef.executeOnStartup) {
                    this.logger.debug(`Executing task on startup: ${taskDef.name}`);
                    taskDef.execute().catch((error) => {
                        this.logger.error(`Startup task execution failed: ${taskDef.name}`, {
                            error,
                            task: taskDef.name,
                        });
                    });
                }

                // Schedule the task
                const task = cron.schedule(taskDef.schedule, () => {
                    taskDef.execute().catch((error) => {
                        this.logger.error(`Scheduled task execution failed: ${taskDef.name}`, {
                            error,
                            task: taskDef.name,
                        });
                    });
                });

                this.tasks.push(task);
                this.logger.debug(`Task scheduled: ${taskDef.name}`, {
                    schedule: taskDef.schedule,
                    task: taskDef.name,
                });
            }

            this.logger.info('Executor initialized successfully');
        } catch (error) {
            this.logger.error('Executor initialization failed', { error });
            throw error;
        }
    }

    public async stop(): Promise<void> {
        this.logger.info('Stopping all scheduled tasks...');

        for (const task of this.tasks) {
            task.stop();
        }
        this.tasks = [];

        this.logger.info('All scheduled tasks stopped');
    }
}
