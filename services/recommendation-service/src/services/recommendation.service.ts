import { UserActivityModel, UserActivity } from '../models/user-activity.model';
import { ProductModel, Product } from '../models/product.model';
import { logger } from '../utils/logger';

export interface Recommendation {
  productId: string;
  score: number;
}

export class RecommendationService {
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // Get user's recent activities
      const userActivities = await UserActivityModel.find({ userId })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      if (userActivities.length === 0) {
        return [];
      }

      // Find similar users based on activity patterns
      const similarUsers = await this.findSimilarUsers(userId, userActivities);
      
      if (similarUsers.length === 0) {
        return [];
      }

      // Get recommended products from similar users
      return this.getRecommendedProducts(userId, similarUsers);
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      return [];
    }
  }

  private async findSimilarUsers(userId: string, userActivities: UserActivity[]): Promise<string[]> {
    try {
      // Get the products the user has interacted with
      const userProductIds = userActivities.map(activity => activity.productId);

      // Find users who have interacted with the same products
      const similarUserActivities = await UserActivityModel.find({
        userId: { $ne: userId },
        productId: { $in: userProductIds }
      }).lean();

      // Group users by their interaction count with the same products
      const userInteractions = new Map<string, number>();
      similarUserActivities.forEach(activity => {
        const count = userInteractions.get(activity.userId) || 0;
        userInteractions.set(activity.userId, count + 1);
      });

      // Sort users by interaction count and get top 5
      return Array.from(userInteractions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([userId]) => userId);
    } catch (error) {
      logger.error('Error finding similar users:', error);
      return [];
    }
  }

  private async getRecommendedProducts(userId: string, similarUsers: string[]): Promise<Recommendation[]> {
    try {
      // Get products that similar users have interacted with
      const similarUserActivities = await UserActivityModel.find({
        userId: { $in: similarUsers }
      }).lean();

      // Get products that the user has already interacted with
      const userActivities = await UserActivityModel.find({ userId }).lean();
      const userProductIds = new Set(userActivities.map(activity => activity.productId));

      // Calculate scores for products
      const recommendations = new Map<string, number>();
      similarUserActivities.forEach(activity => {
        if (!userProductIds.has(activity.productId)) {
          const currentScore = recommendations.get(activity.productId) || 0;
          let activityScore = 0;

          switch (activity.activityType) {
            case 'purchase':
              activityScore = 3;
              break;
            case 'cart':
              activityScore = 2;
              break;
            case 'view':
              activityScore = 1;
              break;
          }

          recommendations.set(activity.productId, currentScore + activityScore);
        }
      });

      // Convert to array and sort by score
      const sortedRecommendations = Array.from(recommendations.entries())
        .map(([productId, score]) => ({ productId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Get top 10 recommendations

      return sortedRecommendations;
    } catch (error) {
      logger.error('Error getting recommended products:', error);
      return [];
    }
  }

  async trackUserActivity(userId: string, productId: string, activityType: string): Promise<void> {
    try {
      await UserActivityModel.create({
        userId,
        productId,
        activityType,
        timestamp: new Date()
      });
      logger.info(`Tracked ${activityType} activity for user ${userId} on product ${productId}`);
    } catch (error) {
      logger.error('Error tracking user activity:', error);
      throw error;
    }
  }
} 