import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface Request extends ExpressRequest {
  user?: {
    id: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        errors: [{
          message: 'No authorization header'
        }]
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        errors: [{
          message: 'No token provided'
        }]
      });
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET as string) as { id: string };
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      logger.error('Error verifying token:', error);
      return res.status(401).json({
        errors: [{
          message: 'Invalid token'
        }]
      });
    }
  } catch (error) {
    logger.error('Error in auth middleware:', error);
    return res.status(500).json({
      errors: [{
        message: 'Internal server error'
      }]
    });
  }
}; 