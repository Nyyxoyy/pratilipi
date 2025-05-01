import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendation.controller';

const router = Router();
const recommendationController = new RecommendationController();

// Generate recommendations for a user
router.get('/:userId', recommendationController.generateRecommendations);

// Track user activity
router.post('/activity', recommendationController.trackActivity);

export const recommendationRouter = router; 