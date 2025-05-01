import { UserService } from '../services/user.service';
import { redis } from '../__mocks__/redis';
import axios from 'axios';

jest.mock('axios');
jest.mock('../redis', () => ({
  redis,
}));

describe('UserService', () => {
  let userService: UserService;
  const mockToken = 'test-token';

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return user data from Redis', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: ['email', 'push'],
      };

      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            user: mockUser,
          },
        },
      });

      const result = await userService.getCurrentUser(mockToken);
      expect(result).toEqual(mockUser);
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    it('should return null if user not found', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue(new Error('User not found'));

      const result = await userService.getCurrentUser(mockToken);
      expect(result).toBeNull();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences in Redis', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        preferences: ['email'],
      };

      const newPreferences = ['email', 'push'];
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
      (redis.set as jest.Mock).mockResolvedValue('OK');
      (axios.put as jest.Mock).mockResolvedValue({
        data: {
          data: {
            user: {
              ...mockUser,
              preferences: newPreferences,
            },
          },
        },
      });

      const result = await userService.updatePreferences(newPreferences, mockToken);

      expect(result).toEqual({
        ...mockUser,
        preferences: newPreferences,
      });
      expect(axios.put).toHaveBeenCalledWith(
        expect.any(String),
        { preferences: newPreferences },
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    it('should throw error if user not found', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (axios.put as jest.Mock).mockRejectedValue(new Error('User not found'));

      await expect(userService.updatePreferences(['email'], mockToken)).rejects.toThrow(
        'User not found'
      );
    });
  });
}); 