import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';

export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOneBy({ email });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    await this.update(id, userData);
    return this.findOneBy({ id });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected === 1;
  }
} 