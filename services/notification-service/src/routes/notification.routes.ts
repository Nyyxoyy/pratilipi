import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validateNotificationInput } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// Create a new notification
router.post('/', authMiddleware, validateNotificationInput, notificationController.createNotification);

// Get unread notifications for a user
router.get('/unread/:userId', authMiddleware, notificationController.getUnreadNotifications);

// Mark a notification as read
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// Get all notifications for a user with pagination and filtering
router.get('/user/:userId', authMiddleware, notificationController.getUserNotifications);

export const notificationRouter = router; 