import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { IUsersService } from '../core/ports/users.service.port';
import { UserEntity } from '../infra/postgres/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

/**
 * UsersService
 *
 * Handles persistence and basic credential verification for users.
 */
@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  /**
   * Create a new user with a hashed password.
   */
  async create(name: string, password: string, role: 'admin' | 'user' = 'user'): Promise<UserEntity> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.repo.create({ name, password: hash, role });
    return await this.repo.save(user);
  }

  /**
   * List all users without exposing password hashes.
   */
  async findAll(): Promise<UserEntity[]> {
    return this.repo.find({ select: { id: true, name: true, role: true } });
  }

  /**
   * Find a user by id.
   */
  async findById(id: string): Promise<UserEntity | null> {
    return await this.repo.findOne({ where: { id } });
  }

  /**
   * Find a user by unique username.
   */
  async findByName(name: string): Promise<UserEntity | null> {
    return await this.repo.findOne({ where: { name } });
  }

  /**
   * Delete a user by id. Throws if not found or if the requester tries to delete themselves.
   * Caller must remove the user's containers first to avoid orphaned rows.
   */
  async remove(id: string, requesterId: string): Promise<void> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (id === requesterId) throw new ForbiddenException('Cannot delete your own account');
    await this.repo.delete(id);
  }

  /**
   * Validate a user's credentials by username and password.
   * Returns the user on success, otherwise null.
   */
  async validateUserByName(name: string, password: string): Promise<UserEntity | null> {
    const existing = await this.findByName(name);
    if (!existing) return null;
    const ok = await bcrypt.compare(password, existing.password);
    return ok ? existing : null;
  }
}
