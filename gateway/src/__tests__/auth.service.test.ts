import { AuthService } from '../services/auth.service';
import { redis } from '../__mocks__/redis';
import jwt from 'jsonwebtoken';

jest.mock('../redis', () => ({
  redis,
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '123',
        email: credentials.email,
        name: 'Test User',
        preferences: ['email'],
      };

      redis.get.mockResolvedValue(JSON.stringify(mockUser));
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login(credentials);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(credentials.email);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw error with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      redis.get.mockResolvedValue(null);

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        preferences: ['email'],
      };

      redis.get.mockResolvedValue(null);
      redis.set.mockResolvedValue('OK');
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.register(userData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(redis.set).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        preferences: ['email'],
      };

      const existingUser = {
        id: '123',
        email: userData.email,
        name: 'Existing User',
        preferences: ['email'],
      };

      redis.get.mockResolvedValue(JSON.stringify(existingUser));

      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });
  });
}); 