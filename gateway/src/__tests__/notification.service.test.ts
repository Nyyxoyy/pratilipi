import { NotificationService } from '../services/notification.service';
import { redis } from '../__mocks__/redis';
import axios from 'axios';

jest.mock('axios');
jest.mock('../redis', () => ({
  redis,
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe('getUserNotifications', () => {
    it('should return user notifications from Redis', async () => {
      const userId = '123';
      const mockNotifications = [
        {
          id: '1',
          userId,
          title: 'Test 1',
          message: 'Message 1',
          type: 'INFO',
          read: false,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          userId,
          title: 'Test 2',
          message: 'Message 2',
          type: 'INFO',
          read: true,
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      (redis.lrange as jest.Mock).mockResolvedValue(mockNotifications.map(n => JSON.stringify(n)));
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            notifications: mockNotifications,
          },
        },
      });

      const result = await notificationService.getUserNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(redis.lrange).toHaveBeenCalledWith(`notifications:${userId}`, 0, -1);
    });

    it('should return empty array if no notifications', async () => {
      const userId = '123';
      (redis.lrange as jest.Mock).mockResolvedValue([]);
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            notifications: [],
          },
        },
      });

      const result = await notificationService.getUserNotifications(userId);

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = '1';
      const mockNotification = {
        id: notificationId,
        userId: '123',
        title: 'Test',
        message: 'Message',
        type: 'INFO',
        read: false,
        createdAt: '2024-01-01T00:00:00Z',
      };

      (redis.lrange as jest.Mock).mockResolvedValue([JSON.stringify(mockNotification)]);
      (redis.lset as jest.Mock).mockResolvedValue('OK');
      (axios.put as jest.Mock).mockResolvedValue({
        data: {
          data: {
            notification: {
              ...mockNotification,
              read: true,
            },
          },
        },
      });

      const result = await notificationService.markAsRead(notificationId);

      expect(result.read).toBe(true);
      expect(redis.lset).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/notifications/${notificationId}/read`),
        expect.any(Object)
      );
    });

    it('should throw error if notification not found', async () => {
      const notificationId = '1';
      (redis.lrange as jest.Mock).mockResolvedValue([]);
      (axios.put as jest.Mock).mockRejectedValue(new Error('Notification not found'));

      await expect(notificationService.markAsRead(notificationId)).rejects.toThrow(
        'Notification not found'
      );
    });
  });
}); 