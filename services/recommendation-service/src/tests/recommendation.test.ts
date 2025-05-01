import { RecommendationService } from '../services/recommendation.service';
import { UserActivityModel } from '../models/user-activity.model';
import { ProductModel } from '../models/product.model';

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;

  beforeEach(() => {
    recommendationService = new RecommendationService();
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations based on user activity', async () => {
      const userId = 'user1';
      const recommendations = await recommendationService.generateRecommendations(userId);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should not recommend products that user has already interacted with', async () => {
      const userId = 'user1';
      const recommendations = await recommendationService.generateRecommendations(userId);
      
      const userActivities = await UserActivityModel.find({ userId });
      const userProductIds = userActivities.map(activity => activity.productId);
      
      recommendations.forEach(recommendation => {
        expect(userProductIds).not.toContain(recommendation.productId);
      });
    });

    it('should return empty array if no similar users found', async () => {
      const userId = 'user3'; // User with no similar users
      const recommendations = await recommendationService.generateRecommendations(userId);
      
      expect(recommendations).toEqual([]);
    });
  });

  describe('trackUserActivity', () => {
    it('should track user activity successfully', async () => {
      const userId = 'user1';
      const productId = 'product1';
      const activityType = 'view';

      await expect(recommendationService.trackUserActivity(userId, productId, activityType))
        .resolves.not.toThrow();

      const activity = await UserActivityModel.findOne({ userId, productId, activityType });
      expect(activity).toBeDefined();
      expect(activity?.userId).toBe(userId);
      expect(activity?.productId).toBe(productId);
      expect(activity?.activityType).toBe(activityType);
    });
  });
}); 