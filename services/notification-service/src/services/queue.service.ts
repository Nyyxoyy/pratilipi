import amqp from 'amqplib';
import { Notification } from '../entities/notification.entity';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

export class QueueService {
  private channel: any;
  private notificationRepository = AppDataSource.getRepository(Notification);

  async connect() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672');
      this.channel = await connection.createChannel();

      // Set up queues and exchanges
      await this.channel.assertExchange('user-events', 'topic', { durable: true });
      await this.channel.assertExchange('recommendation-events', 'topic', { durable: true });

      await this.channel.assertQueue('notification-user-events', { durable: true });
      await this.channel.assertQueue('notification-recommendation-events', { durable: true });

      await this.channel.bindQueue('notification-user-events', 'user-events', 'user.#');
      await this.channel.bindQueue('notification-recommendation-events', 'recommendation-events', 'recommendation.#');

      // Start consuming messages
      await this.consumeMessages();
    } catch (error) {
      logger.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  private async consumeMessages() {
    try {
      // Consume user events
      await this.channel.consume('notification-user-events', async (msg: any) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            const { event, data } = content;

            switch (event) {
              case 'user.created':
                await this.handleUserCreated(data);
                break;
              case 'user.preferences.updated':
                await this.handlePreferencesUpdated(data);
                break;
              default:
                logger.warn(`Unknown event type: ${event}`);
            }

            this.channel.ack(msg);
          } catch (error) {
            logger.error('Error processing message:', error);
            this.channel.nack(msg);
          }
        }
      });

      // Consume recommendation events
      await this.channel.consume('notification-recommendation-events', async (msg: any) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            const { event, data } = content;

            if (event === 'recommendation.generated') {
              await this.handleRecommendationGenerated(data);
            }

            this.channel.ack(msg);
          } catch (error) {
            logger.error('Error processing message:', error);
            this.channel.nack(msg);
          }
        }
      });
    } catch (error) {
      logger.error('Error setting up message consumption:', error);
      throw error;
    }
  }

  private async handleUserCreated(data: any) {
    const { id, name, email, preferences } = data;

    const notification = this.notificationRepository.create({
      userId: id,
      type: 'WELCOME',
      content: `Welcome to our platform, ${name}!`,
    });

    await this.notificationRepository.save(notification);
  }

  private async handlePreferencesUpdated(data: any) {
    const { id, preferences } = data;

    const notification = this.notificationRepository.create({
      userId: id,
      type: 'PREFERENCE_UPDATE',
      content: 'Your notification preferences have been updated successfully.',
    });

    await this.notificationRepository.save(notification);
  }

  private async handleRecommendationGenerated(data: any) {
    const { userId, recommendations } = data;

    const notification = this.notificationRepository.create({
      userId,
      type: 'RECOMMENDATION',
      content: 'New recommendations are available for you!',
    });

    await this.notificationRepository.save(notification);
  }
} 