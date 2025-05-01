import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import { setupRabbitMQ } from './config/rabbitmq';
import { userRouter } from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);

// Error handling
app.use(errorHandler);

const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Initialize RabbitMQ connection (non-blocking)
    setupRabbitMQ().catch(error => {
      logger.error('Failed to initialize RabbitMQ:', error);
    });

    app.listen(port, () => {
      logger.info(`User service listening on port ${port}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer(); 