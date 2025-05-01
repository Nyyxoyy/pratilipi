import { Request, Response } from 'express';
import { validate } from 'class-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppError } from '../middleware/error.middleware';
import { publishUserEvent } from '../config/rabbitmq';
import { logger } from '../utils/logger';
import { AppDataSource } from '../config/database';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, preferences } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Create new user instance
      const user = this.userRepository.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        preferences: preferences || [],
      });

      // Validate user data
      const errors = await validate(user);
      if (errors.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: errors.map(e => e.constraints)
        });
      }

      // Save user
      await this.userRepository.save(user);

      // Publish user created event
      await publishUserEvent('user.created', {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences: user.preferences,
          },
          token,
        },
      });
    } catch (error) {
      logger.error('Error in user registration:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'name', 'email', 'password', 'preferences'],
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences: user.preferences,
          },
          token,
        },
      });
    } catch (error) {
      logger.error('Error in user login:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  getCurrentUser = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'name', 'email', 'preferences'],
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      logger.error('Error getting current user:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  getPreferences = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['preferences'],
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        status: 'success',
        data: { preferences: user.preferences },
      });
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      throw error;
    }
  };

  updatePreferences = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { preferences } = req.body;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      user.preferences = preferences;
      await this.userRepository.save(user);

      // Publish preferences updated event
      await publishUserEvent('user.preferences.updated', {
        id: user.id,
        preferences: user.preferences,
      });

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences: user.preferences,
          },
        },
      });
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences: user.preferences,
          },
        },
      });
    } catch (error) {
      logger.error('Error getting user by id:', error);
      throw error;
    }
  };
} 