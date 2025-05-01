import Redis from 'ioredis';
import { logger } from '../utils/logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

export class CacheService {
  private client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting');
    });

    this.client.on('ready', () => {
      logger.info('Redis Client Ready');
      this.isConnected = true;
    });
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, returning null');
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Error getting value from cache:', error);
      return null;
    }
  }

  async set(key: string, value: string, expirationInSeconds: number): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping set');
      return;
    }

    try {
      await this.client.set(key, value, 'EX', expirationInSeconds);
    } catch (error) {
      logger.error('Error setting value in cache:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Redis not connected, skipping delete');
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Error deleting value from cache:', error);
    }
  }
} 