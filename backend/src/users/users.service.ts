import { Injectable } from '@nestjs/common';
import { UserEntity } from '../infra/postgres/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async create(name: string, password: string): Promise<UserEntity> {
    const user = this.repo.create({ name, password });
    return await this.repo.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<UserEntity | null> {
    return await this.repo.findOne({ where: { name } });
  }

  async validateUser(id: string, password: string): Promise<UserEntity | null> {
    const existing = await this.findById(id);
    if (!existing || existing.password !== password) {
      return null;
    }
    return existing;
  }
}
