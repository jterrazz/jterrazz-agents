import { createContainer } from './di/container.js';

(async () => {
    const container = createContainer();
    const chatBot = container.get('ChatBot');
    const executor = container.get('Executor');
    const logger = container.get('Logger');

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
        logger.info(`Received ${signal}. Starting graceful shutdown...`);

        try {
            // Stop executor first to prevent new jobs from starting
            await executor.stop();

            // Disconnect from Discord
            await chatBot.disconnect();

            logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during shutdown:', { error });
            process.exit(1);
        }
    };

    // Register signal handlers for graceful shutdown
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', { error });
        shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection:', { promise, reason });
        shutdown('unhandledRejection');
    });

    try {
        // Connect to Discord
        await chatBot.connect();

        // Initialize executor for scheduled jobs
        await executor.initialize();

        logger.info('Application started successfully.');
    } catch (error) {
        logger.error('Failed to start application:', { error });
        await shutdown('startup-error');
    }
})();
