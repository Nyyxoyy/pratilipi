import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(authMiddleware);
router.get('/me', userController.getCurrentUser);
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);
router.get('/:id', userController.getUserById);

export const userRouter = router; 