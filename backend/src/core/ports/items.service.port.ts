import type { ItemEntity } from '../../infra/postgres/entities/item.entity';
import type { PaginationQueryDto, PaginatedResponse } from '../../shared/dto/pagination.dto';
import type { CreateItemDto } from '../../items/dto/create-item.dto';
import type { UpdateItemDto } from '../../items/dto/update-item.dto';
import type { AuthenticatedRequest } from '../../shared/auth/types';

type AuthUser = AuthenticatedRequest['user'];

/**
 * Port for item operations inside containers with access control.
 */
export interface IItemsService {
  /**
   * List items in a container owned/visible to the user.
   */
  listByContainer(containerId: string, user: AuthUser): Promise<ItemEntity[]>;
  /**
   * Paginated version of `listByContainer`.
   */
  listByContainer(containerId: string, q: PaginationQueryDto, user: AuthUser): Promise<PaginatedResponse<ItemEntity>>;
  /**
   * Create an item within the specified container.
   */
  create(containerId: string, dto: CreateItemDto, user: AuthUser): Promise<ItemEntity>;
  /**
   * Update an item after container ownership check.
   */
  update(id: string, dto: UpdateItemDto, user: AuthUser): Promise<ItemEntity>;
  /**
   * Remove an item after container ownership check.
   */
  remove(id: string, user: AuthUser): Promise<void>;
}
