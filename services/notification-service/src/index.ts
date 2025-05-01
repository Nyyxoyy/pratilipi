import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import { notificationRouter } from './routes/notification.routes';
import { errorHandler } from './middleware/error.middleware';
import { QueueService } from './services/queue.service';
import { SchedulerService } from './services/scheduler.service';
import { logger } from './utils/logger';
import { AppDataSource } from './config/database';

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`, { 
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      return res.status(503).json({ status: 'error', message: 'Database not initialized' });
    }
    await AppDataSource.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/notifications', notificationRouter);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Connect to RabbitMQ and start consuming messages
    const queueService = new QueueService();
    await queueService.connect();

    // Start scheduler service
    const schedulerService = new SchedulerService();
    await schedulerService.startScheduledJobs();

    app.listen(port, () => {
      logger.info(`Notification service listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 