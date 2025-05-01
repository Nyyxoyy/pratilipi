import { RecommendationService } from '../services/recommendation.service';
import { redis } from '../__mocks__/redis';

jest.mock('../redis', () => ({
  redis,
}));

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;

  beforeEach(() => {
    recommendationService = new RecommendationService();
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should return cached recommendations if available', async () => {
      const userId = '123';
      const mockRecommendations = [
        { id: '1', title: 'Product 1', score: 0.9 },
        { id: '2', title: 'Product 2', score: 0.8 },
      ];

      redis.get.mockResolvedValue(JSON.stringify(mockRecommendations));

      const result = await recommendationService.getRecommendations(userId);

      expect(result).toEqual(mockRecommendations);
      expect(redis.get).toHaveBeenCalledWith(`recommendations:${userId}`);
    });

    it('should return empty array if no cached recommendations', async () => {
      const userId = '123';
      redis.get.mockResolvedValue(null);

      const result = await recommendationService.getRecommendations(userId);

      expect(result).toEqual([]);
    });
  });

  describe('trackActivity', () => {
    it('should track user activity and invalidate recommendations cache', async () => {
      const input = {
        userId: 'test-user',
        productId: 'test-product',
        activityType: 'view' as const
      };

      redis.del.mockResolvedValue(1);

      await recommendationService.trackActivity(input);

      expect(redis.del).toHaveBeenCalledWith(`recommendations:${input.userId}`);
    });
  });
}); 