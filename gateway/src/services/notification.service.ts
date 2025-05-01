import axios from 'axios';
import { logger } from '../utils/logger';

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002';

export class NotificationService {
  async getUserNotifications(userId: string, type?: string) {
    try {
      const url = new URL(`${NOTIFICATION_SERVICE_URL}/notifications/user/${userId}`);
      if (type) {
        url.searchParams.append('type', type);
      }

      const response = await axios.get(url.toString());
      if (!response.data.data || !response.data.data.notifications) {
        throw new Error('Invalid response format from notification service');
      }
      return response.data.data.notifications;
    } catch (error: any) {
      logger.error('Error getting user notifications:', error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getUnreadNotifications(userId: string) {
    try {
      const response = await axios.get(
        `${NOTIFICATION_SERVICE_URL}/notifications/unread/${userId}`
      );
      if (!response.data.data || !response.data.data.notifications) {
        throw new Error('Invalid response format from notification service');
      }
      return response.data.data.notifications;
    } catch (error: any) {
      logger.error('Error getting unread notifications:', error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async markAsRead(id: string) {
    try {
      const response = await axios.patch(
        `${NOTIFICATION_SERVICE_URL}/notifications/${id}/read`
      );
      if (!response.data.data || !response.data.data.notification) {
        throw new Error('Invalid response format from notification service');
      }
      return response.data.data.notification;
    } catch (error: any) {
      logger.error('Error marking notification as read:', error);
      if (error.response?.status === 404) {
        throw new Error('Notification not found');
      }
      throw error;
    }
  }

  async createNotification(input: { userId: string; type: string; content: string }) {
    try {
      const response = await axios.post(
        `${NOTIFICATION_SERVICE_URL}/notifications`,
        input
      );
      if (!response.data.data || !response.data.data.notification) {
        throw new Error('Invalid response format from notification service');
      }
      return response.data.data.notification;
    } catch (error: any) {
      logger.error('Error creating notification:', error);
      if (error.response?.status === 400) {
        throw new Error('Invalid notification data');
      }
      throw error;
    }
  }
}