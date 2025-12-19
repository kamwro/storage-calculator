import { Injectable } from '@nestjs/common';
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

  async create(name: string, password: string, role: 'admin' | 'user' = 'user'): Promise<UserEntity> {
    const hash = await bcrypt.hash(password, 10);
    const user = this.repo.create({ name, password: hash, role });
    return await this.repo.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<UserEntity | null> {
    return await this.repo.findOne({ where: { name } });
  }

  async validateUserByName(name: string, password: string): Promise<UserEntity | null> {
    const existing = await this.findByName(name);
    if (!existing) return null;
    const ok = await bcrypt.compare(password, existing.password);
    return ok ? existing : null;
  }
}
