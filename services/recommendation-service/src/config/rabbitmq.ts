import amqp from 'amqplib';
import { logger } from '../utils/logger';

const RETRY_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 10;

export async function connectToRabbitMQ(retries = 0): Promise<any> {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
    logger.info('Successfully connected to RabbitMQ');
    return connection;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`Failed to connect to RabbitMQ. Retrying in ${RETRY_INTERVAL}ms... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return connectToRabbitMQ(retries + 1);
    }
    logger.error('Failed to connect to RabbitMQ after maximum retries:', error);
    throw error;
  }
}

export async function waitForRabbitMQ(): Promise<void> {
  try {
    await connectToRabbitMQ();
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
} 