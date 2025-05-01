import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const validateNotificationInput = (req: Request, res: Response, next: NextFunction) => {
  const { userId, type, content } = req.body;

  if (!userId || typeof userId !== 'string') {
    throw new AppError(400, 'userId is required and must be a string');
  }

  if (!type || typeof type !== 'string') {
    throw new AppError(400, 'type is required and must be a string');
  }

  if (!content || typeof content !== 'string') {
    throw new AppError(400, 'content is required and must be a string');
  }

  next();
}; 