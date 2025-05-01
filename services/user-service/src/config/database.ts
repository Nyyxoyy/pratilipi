import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { logger } from '../utils/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'user_db',
  synchronize: true,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
});

const RETRY_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 10;

export const initializeDatabase = async (retries = 0): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`Failed to connect to database. Retrying in ${RETRY_INTERVAL}ms... (${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return initializeDatabase(retries + 1);
    }
    logger.error('Error connecting to database:', error);
    throw error;
  }
}; 