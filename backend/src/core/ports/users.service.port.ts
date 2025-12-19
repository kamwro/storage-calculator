import type { UserEntity } from '../../infra/postgres/entities/user.entity';

/**
 * Port for user persistence and credential verification.
 */
export interface IUsersService {
  /**
   * Create a new user with a hashed password.
   */
  create(name: string, password: string, role?: 'admin' | 'user'): Promise<UserEntity>;
  /**
   * Find a user by id or return null if missing.
   */
  findById(id: string): Promise<UserEntity | null>;
  /**
   * Find a user by unique name or return null if missing.
   */
  findByName(name: string): Promise<UserEntity | null>;
  /**
   * Validate a plain-text password against a user's stored hash; returns the user on success.
   */
  validateUserByName(name: string, password: string): Promise<UserEntity | null>;
}
