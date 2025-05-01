import axios from 'axios';
import { logger } from '../utils/logger';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  preferences: string[];
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/api/users/register`, input);
      return response.data.data;
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  async login(input: LoginInput) {
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/api/users/login`, input);
      return response.data.data;
    } catch (error: any) {
      logger.error('Error logging in user:', error);
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data.user;
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw error;
    }
  }
} 