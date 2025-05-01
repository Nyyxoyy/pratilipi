import { UserRepository } from './user.repository';
import { AppDataSource } from '../config/database';

export const userRepository = new UserRepository(AppDataSource); 