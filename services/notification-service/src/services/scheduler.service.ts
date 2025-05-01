import { Notification } from '../entities/notification.entity';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';
import cron from 'node-cron';

export class SchedulerService {
  private notificationRepository = AppDataSource.getRepository(Notification);

  async startScheduledJobs() {
    // Wait for database to be initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Send promotional notifications every day at 10:00 AM
    cron.schedule('0 10 * * *', () => {
      this.sendPromotionalNotifications();
    });

    // Send order status notifications every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.sendOrderStatusNotifications();
    });

    logger.info('Scheduled jobs started');
  }

  private async sendPromotionalNotifications() {
    try {
      // In a real application, you would fetch users who have opted for promotional notifications
      const users = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];

      for (const user of users) {
        const notification = this.notificationRepository.create({
          userId: user.id,
          type: 'PROMOTION',
          content: `Special promotion for ${user.name}! Check out our latest offers.`,
        });

        await this.notificationRepository.save(notification);
      }

      logger.info('Promotional notifications sent');
    } catch (error) {
      logger.error('Error sending promotional notifications:', error);
    }
  }

  private async sendOrderStatusNotifications() {
    try {
      // In a real application, you would fetch orders that need status updates
      const orders = [
        { id: '1', userId: '1', status: 'SHIPPED' },
        { id: '2', userId: '2', status: 'DELIVERED' },
      ];

      for (const order of orders) {
        const notification = this.notificationRepository.create({
          userId: order.userId,
          type: 'ORDER_STATUS',
          content: `Your order #${order.id} has been ${order.status.toLowerCase()}.`,
        });

        await this.notificationRepository.save(notification);
      }

      logger.info('Order status notifications sent');
    } catch (error) {
      logger.error('Error sending order status notifications:', error);
    }
  }
} 