import amqp from 'amqplib';
import { logger } from '../utils/logger';

let channel: amqp.Channel | null = null;
const RETRY_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 10;

export const setupRabbitMQ = async (retries = 0): Promise<amqp.Channel | null> => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
    channel = await connection.createChannel();

    // Declare exchanges
    await channel.assertExchange('user-events', 'topic', { durable: true });

    logger.info('RabbitMQ connection established');
    return channel;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`Failed to connect to RabbitMQ. Retrying in ${RETRY_INTERVAL}ms... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return setupRabbitMQ(retries + 1);
    }
    logger.error('Error connecting to RabbitMQ:', error);
    return null;
  }
};

export const publishUserEvent = async (routingKey: string, data: any) => {
  try {
    if (!channel) {
      logger.warn('RabbitMQ channel not initialized, skipping event publishing');
      return;
    }

    channel.publish(
      'user-events',
      routingKey,
      Buffer.from(JSON.stringify(data))
    );
  } catch (error) {
    logger.error('Error publishing to RabbitMQ:', error);
  }
}; 