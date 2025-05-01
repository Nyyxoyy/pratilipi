import amqp from 'amqplib';
import { RecommendationService } from './recommendation.service';
import { logger } from '../utils/logger';

export class QueueService {
  private channel: amqp.Channel | null = null;
  private recommendationService = new RecommendationService();

  async connect() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      this.channel = await connection.createChannel();

      // Declare exchanges
      await this.channel.assertExchange('user-events', 'topic', { durable: true });
      await this.channel.assertExchange('recommendation-events', 'topic', { durable: true });

      // Declare queues
      await this.channel.assertQueue('recommendation-user-events', { durable: true });

      // Bind queues to exchanges
      await this.channel.bindQueue('recommendation-user-events', 'user-events', 'user.activity.#');

      // Start consuming messages
      this.consumeUserEvents();

      logger.info('Connected to RabbitMQ and started consuming messages');
    } catch (error) {
      logger.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  private async consumeUserEvents() {
    if (!this.channel) return;

    await this.channel.consume('recommendation-user-events', async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;

        if (routingKey.startsWith('user.activity')) {
          await this.handleUserActivity(content);
        }

        this.channel?.ack(msg);
      } catch (error) {
        logger.error('Error processing user event:', error);
        this.channel?.nack(msg, false, false);
      }
    });
  }

  private async handleUserActivity(data: any) {
    try {
      await this.recommendationService.trackUserActivity(
        data.userId,
        data.productId,
        data.activityType
      );

      // Generate new recommendations after tracking activity
      const recommendations = await this.recommendationService.generateRecommendations(data.userId);

      // Publish recommendations event
      if (this.channel && recommendations.length > 0) {
        this.channel.publish(
          'recommendation-events',
          'recommendation.generated',
          Buffer.from(JSON.stringify({
            userId: data.userId,
            recommendations,
          }))
        );
      }
    } catch (error) {
      logger.error('Error handling user activity:', error);
      throw error;
    }
  }
} 