import { Inject, Injectable } from '@nestjs/common';
import { ITEMS_SERVICE } from '../tokens';
import type { IItemsService } from '../ports/items.service.port';
import type { UpdateItemDto } from '../../items/dto/update-item.dto';
import type { AuthenticatedRequest } from '../../shared/auth/types';
import type { ItemEntity } from '../../infra/postgres/entities/item.entity';

type AuthUser = AuthenticatedRequest['user'];

/**
 * UpdateItemInContainerUseCase
 *
 * Orchestrates updating an item:
 * 1. Validates ownership and existence.
 * 2. Applies updates to the item.
 */
@Injectable()
export class UpdateItemInContainerUseCase {
  constructor(@Inject(ITEMS_SERVICE) private readonly itemsService: IItemsService) {}

  async execute(id: string, dto: UpdateItemDto, user: AuthUser): Promise<ItemEntity> {
    return await this.itemsService.update(id, dto, user);
  }
}
