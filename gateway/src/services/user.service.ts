import axios from 'axios';
import { logger } from '../utils/logger';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

export class UserService {
  async getCurrentUser(token: string) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data.user;
    } catch (error) {
      logger.error('Error getting current user:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${id}`);
      return response.data.data.user;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async updatePreferences(preferences: string[], token: string) {
    try {
      const response = await axios.put(
        `${USER_SERVICE_URL}/api/users/preferences`,
        { preferences },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data.user;
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  }
} 