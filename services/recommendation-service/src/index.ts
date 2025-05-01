import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { recommendationRouter } from './routes/recommendation.routes';
import { connectToDatabase } from './config/database';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recommendations', recommendationRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      logger.info(`Recommendation service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 