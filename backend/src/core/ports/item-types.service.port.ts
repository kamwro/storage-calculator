import type { PaginationQueryDto, PaginatedResponse } from '../../shared/dto/pagination.dto';
import type { CreateItemTypeDto } from '../../item-types/dto/create-item-type.dto';
import type { ItemTypeEntity } from '../../infra/postgres/entities/item-type.entity';

export interface IItemTypesService {
  findAll(q: PaginationQueryDto): Promise<PaginatedResponse<ItemTypeEntity>>;
  create(dto: CreateItemTypeDto): Promise<ItemTypeEntity>;
  findById(id: string): Promise<ItemTypeEntity>;
}
