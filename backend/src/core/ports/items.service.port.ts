import type { ItemEntity } from '../../infra/postgres/entities/item.entity';
import type { PaginationQueryDto, PaginatedResponse } from '../../shared/dto/pagination.dto';
import type { CreateItemDto } from '../../items/dto/create-item.dto';
import type { UpdateItemDto } from '../../items/dto/update-item.dto';
import type { AuthenticatedRequest } from '../../shared/auth/types';

type AuthUser = AuthenticatedRequest['user'];

export interface IItemsService {
  listByContainer(containerId: string, user: AuthUser): Promise<ItemEntity[]>;
  listByContainer(
    containerId: string,
    q: PaginationQueryDto,
    user: AuthUser,
  ): Promise<PaginatedResponse<ItemEntity>>;
  create(containerId: string, dto: CreateItemDto, user: AuthUser): Promise<ItemEntity>;
  update(id: string, dto: UpdateItemDto, user: AuthUser): Promise<ItemEntity>;
  remove(id: string, user: AuthUser): Promise<void>;
}
