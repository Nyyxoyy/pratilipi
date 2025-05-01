import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { logger } from '../utils/logger';

export class RecommendationController {
  private recommendationService = new RecommendationService();

  generateRecommendations = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const recommendations = await this.recommendationService.generateRecommendations(userId);

      res.json({
        status: 'success',
        data: { recommendations },
      });
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate recommendations',
      });
    }
  };

  trackActivity = async (req: Request, res: Response) => {
    try {
      const { userId, productId, activityType } = req.body;

      await this.recommendationService.trackUserActivity(userId, productId, activityType);

      res.status(201).json({
        status: 'success',
        message: 'Activity tracked successfully',
      });
    } catch (error) {
      logger.error('Error tracking activity:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to track activity',
      });
    }
  };
} 