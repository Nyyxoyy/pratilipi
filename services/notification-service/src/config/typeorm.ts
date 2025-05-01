import { Notification } from '../entities/notification.entity';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'notification_db',
  synchronize: true,
  logging: true,
  entities: [Notification],
  subscribers: [],
  migrations: [],
}); 