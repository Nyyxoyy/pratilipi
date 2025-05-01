import { GraphQLScalarType } from 'graphql';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { RecommendationService } from '../services/recommendation.service';
import { AuthService } from '../services/auth.service';
import { CacheService } from '../services/cache.service';
import { logger } from '../utils/logger';
import { IResolvers } from '@graphql-tools/utils';
import { Context } from '../context';

interface User {
  id: string;
  email: string;
  name: string;
  preferences: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  preferences: string[];
}

interface LoginInput {
  email: string;
  password: string;
}

interface ActivityInput {
  userId: string;
  productId: string;
  activityType: 'view' | 'purchase';
}

interface NotificationInput {
  userId: string;
  type: string;
  content: string;
}

const userService = new UserService();
const notificationService = new NotificationService();
const recommendationService = new RecommendationService();
const authService = new AuthService();
const cacheService = new CacheService();

export const resolvers: IResolvers<any, Context> = {
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
  }),

  Query: {
    me: async (_: any, __: any, context: Context) => {
      const token = context.getToken();
      if (!token) return null;
      return userService.getCurrentUser(token);
    },

    user: async (_: any, { id }: { id: string }) => {
      return userService.getUserById(id);
    },

    notifications: async (_, { userId, type }, context: Context) => {
      const authUserId = context.getUserId();
      if (!authUserId) {
        throw new Error('Not authenticated');
      }
      const notifications = await notificationService.getUserNotifications(userId, type);
      return notifications;
    },

    unreadNotifications: async (_: any, { userId }: { userId: string }, context: Context) => {
      const authUserId = context.getUserId();
      if (!authUserId) {
        throw new Error('Not authenticated');
      }
      const notifications = await notificationService.getUnreadNotifications(userId);
      return notifications;
    },

    recommendations: async (_: any, { userId }: { userId: string }) => {
      // Try to get recommendations from cache
      const cachedRecommendations = await cacheService.get(`recommendations:${userId}`);
      if (cachedRecommendations) {
        return JSON.parse(cachedRecommendations);
      }

      // Get fresh recommendations
      const recommendations = await recommendationService.getRecommendations(userId);

      // Cache the recommendations for 1 hour
      await cacheService.set(`recommendations:${userId}`, JSON.stringify(recommendations), 3600);

      return recommendations;
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }) => {
      return authService.register(input);
    },

    login: async (_: any, { input }: { input: LoginInput }) => {
      try {
        return authService.login(input);
      } catch (error: any) {
        if (error.message === 'Invalid credentials') {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
    },

    updatePreferences: async (_: any, { preferences }: { preferences: string[] }, context: Context) => {
      const token = context.getToken();
      if (!token) throw new Error('Not authenticated');
      return userService.updatePreferences(preferences, token);
    },

    markNotificationAsRead: async (_, { id }, context: Context) => {
      const userId = context.getUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }
      try {
        const notification = await notificationService.markAsRead(id);
        return notification;
      } catch (error: any) {
        if (error.message === 'Notification not found') {
          throw new Error('Notification not found');
        }
        throw error;
      }
    },

    trackUserActivity: async (_: any, { input }: { input: ActivityInput }) => {
      try {
        await recommendationService.trackActivity(input);
        return true;
      } catch (error) {
        logger.error('Error tracking user activity:', error);
        return false;
      }
    },

    createNotification: async (_, { input }: { input: NotificationInput }, context: Context) => {
      const userId = context.getUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      if (!input.userId || !input.type || !input.content) {
        throw new Error('Invalid notification input');
      }

      try {
        const notification = await notificationService.createNotification(input);
        return notification;
      } catch (error: any) {
        if (error.message === 'Invalid notification data') {
          throw new Error('Invalid notification data');
        }
        throw error;
      }
    },
  },

  User: {
    notifications: async (parent: User) => {
      const notifications = await notificationService.getUserNotifications(parent.id);
      return notifications;
    },

    recommendations: async (parent: User) => {
      // Try to get recommendations from cache
      const cachedRecommendations = await cacheService.get(`recommendations:${parent.id}`);
      if (cachedRecommendations) {
        return JSON.parse(cachedRecommendations);
      }

      // Get fresh recommendations
      const recommendations = await recommendationService.getRecommendations(parent.id);

      // Cache the recommendations for 1 hour
      await cacheService.set(`recommendations:${parent.id}`, JSON.stringify(recommendations), 3600);

      return recommendations;
    },
  },
}; 