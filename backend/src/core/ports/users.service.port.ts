import type { UserEntity } from '../../infra/postgres/entities/user.entity';

export interface IUsersService {
  create(name: string, password: string, role?: 'admin' | 'user'): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByName(name: string): Promise<UserEntity | null>;
  validateUserByName(name: string, password: string): Promise<UserEntity | null>;
}
