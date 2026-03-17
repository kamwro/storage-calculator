import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USERS_SERVICE } from '../tokens';
import type { IUsersService } from '../ports/users.service.port';
import type { UserEntity } from '../../infra/postgres/entities/user.entity';

export interface CreateUserInput {
  username: string;
  password: string;
  role?: 'admin' | 'user';
}

/**
 * CreateUserUseCase
 *
 * Orchestrates user creation:
 * 1. Checks for existing username.
 * 2. Delegates hashing and persistence to UsersService.
 *
 * Note: If the domain logic for password hashing grows,
 * it should be extracted into its own utility or collaborator.
 */
@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USERS_SERVICE) private readonly usersService: IUsersService) {}

  async execute(input: CreateUserInput): Promise<UserEntity> {
    const existing = await this.usersService.findByName(input.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    return await this.usersService.create(input.username, input.password, input.role || 'user');
  }
}
