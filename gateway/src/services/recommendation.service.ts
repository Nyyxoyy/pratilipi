import axios from 'axios';
import { logger } from '../utils/logger';

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3003';

interface ActivityInput {
  userId: string;
  productId: string;
  activityType: 'view' | 'purchase';
}

export class RecommendationService {
  async getRecommendations(userId: string) {
    try {
      const response = await axios.get(
        `${RECOMMENDATION_SERVICE_URL}/api/recommendations/${userId}`
      );
      return response.data.data.recommendations;
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  }

  async trackActivity(input: ActivityInput) {
    try {
      await axios.post(`${RECOMMENDATION_SERVICE_URL}/api/recommendations/activity`, input);
    } catch (error) {
      logger.error('Error tracking activity:', error);
      throw error;
    }
  }
} 