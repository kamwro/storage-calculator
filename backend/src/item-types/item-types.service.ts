import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { PaginationQueryDto, PaginatedResponse } from '../shared/dto/pagination.dto';
import { buildOrder, toPaginatedResponse } from '../shared/pagination/pagination.util';
import type { IItemTypesService } from '../core/ports/item-types.service.port';

/**
 * ItemTypesService
 *
 * Provides listing and creation of item types which define unit weight/volume
 * used when calculating container utilization and allocations.
 */
@Injectable()
export class ItemTypesService implements IItemTypesService {
  constructor(
    @InjectRepository(ItemTypeEntity)
    private readonly repo: Repository<ItemTypeEntity>,
  ) {}

  /**
   * List item types with pagination and optional sorting.
   */
  async findAll(q: PaginationQueryDto): Promise<PaginatedResponse<ItemTypeEntity>> {
    const order = buildOrder<ItemTypeEntity>(['name', 'unitWeightKg', 'unitVolumeM3', 'id'], q.sort, q.dir);
    const [data, total] = await this.repo.findAndCount({
      order,
      skip: q.offset ?? 0,
      take: q.limit ?? 20,
    });
    return toPaginatedResponse(data, total, q.offset ?? 0, q.limit ?? 20);
  }

  /**
   * Create a new item type.
   */
  async create(dto: CreateItemTypeDto): Promise<ItemTypeEntity> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  /**
   * Retrieve a single item type by id.
   * @throws NotFoundException when the item type does not exist
   */
  async findById(id: string): Promise<ItemTypeEntity> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item type not found');
    return item;
  }
}
