import type { PaginationQueryDto, PaginatedResponse } from '../../shared/dto/pagination.dto';
import type { CreateItemTypeDto } from '../../item-types/dto/create-item-type.dto';
import type { ItemTypeEntity } from '../../infra/postgres/entities/item-type.entity';

/**
 * Port for item type catalogue operations.
 */
export interface IItemTypesService {
  /**
   * List item types with pagination and optional sorting.
   */
  findAll(q: PaginationQueryDto): Promise<PaginatedResponse<ItemTypeEntity>>;
  /**
   * Create a new item type definition.
   */
  create(dto: CreateItemTypeDto): Promise<ItemTypeEntity>;
  /**
   * Retrieve a single item type by its id.
   */
  findById(id: string): Promise<ItemTypeEntity>;
}
