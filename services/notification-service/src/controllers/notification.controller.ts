import { Request, Response } from 'express';
import { Notification } from '../entities/notification.entity';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';

export class NotificationController {
  private notificationRepository = AppDataSource.getRepository(Notification);

  createNotification = async (req: Request, res: Response) => {
    try {
      logger.info('Received create notification request:', { body: req.body });
      const { userId, type, content } = req.body;

      const notification = this.notificationRepository.create({
        userId,
        type,
        content,
      });

      const savedNotification = await this.notificationRepository.save(notification);
      logger.info('Notification created successfully:', { notification: savedNotification });

      res.status(201).json({
        id: savedNotification.id,
        userId: savedNotification.userId,
        type: savedNotification.type,
        content: savedNotification.content,
        read: savedNotification.read,
        sentAt: savedNotification.sentAt.toISOString(),
      });
    } catch (error) {
      logger.error('Error creating notification:', error);
      res.status(500).json({
        errors: [{
          message: 'Internal server error'
        }]
      });
    }
  };

  getUnreadNotifications = async (req: Request, res: Response) => {
    try {
      logger.info('Received get unread notifications request:', { params: req.params });
      const { userId } = req.params;

      const notifications = await this.notificationRepository.find({
        where: {
          userId,
          read: false,
        },
        order: {
          sentAt: 'DESC',
        },
      });

      logger.info('Found unread notifications:', { count: notifications.length });
      res.json({
        data: {
          notifications: notifications.map(notification => ({
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            content: notification.content,
            read: notification.read,
            sentAt: notification.sentAt.toISOString(),
          }))
        }
      });
    } catch (error) {
      logger.error('Error getting unread notifications:', error);
      res.status(500).json({
        errors: [{
          message: 'Internal server error'
        }]
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      logger.info('Received mark as read request:', { params: req.params });
      const { id } = req.params;

      const notification = await this.notificationRepository.findOne({
        where: { id },
      });

      if (!notification) {
        logger.warn('Notification not found:', { id });
        return res.status(404).json({
          errors: [{
            message: 'Notification not found',
          }]
        });
      }

      notification.read = true;
      const updatedNotification = await this.notificationRepository.save(notification);
      logger.info('Notification marked as read:', { notification: updatedNotification });

      res.json({
        id: updatedNotification.id,
        userId: updatedNotification.userId,
        type: updatedNotification.type,
        content: updatedNotification.content,
        read: updatedNotification.read,
        sentAt: updatedNotification.sentAt.toISOString(),
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        errors: [{
          message: 'Internal server error'
        }]
      });
    }
  };

  getUserNotifications = async (req: Request, res: Response) => {
    try {
      logger.info('Received get user notifications request:', { params: req.params, query: req.query });
      const { userId } = req.params;
      const { type } = req.query;

      const queryBuilder = this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.userId = :userId', { userId });

      if (type) {
        queryBuilder.andWhere('notification.type = :type', { type });
      }

      const notifications = await queryBuilder
        .orderBy('notification.sentAt', 'DESC')
        .getMany();

      logger.info('Found user notifications:', { count: notifications.length });
      res.json({
        data: {
          notifications: notifications.map(notification => ({
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            content: notification.content,
            read: notification.read,
            sentAt: notification.sentAt.toISOString(),
          }))
        }
      });
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(500).json({
        errors: [{
          message: 'Internal server error'
        }]
      });
    }
  };
} 