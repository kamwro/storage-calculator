import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';

@Injectable()
export class ItemTypesService {
  constructor(
    @InjectRepository(ItemTypeEntity)
    private readonly repo: Repository<ItemTypeEntity>,
  ) {}

  findAll(): Promise<ItemTypeEntity[]> {
    return this.repo.find();
  }

  async create(dto: CreateItemTypeDto): Promise<ItemTypeEntity> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async findById(id: string): Promise<ItemTypeEntity> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item type not found');
    return item;
  }
}
