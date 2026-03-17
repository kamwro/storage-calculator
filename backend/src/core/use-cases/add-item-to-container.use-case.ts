import { Inject, Injectable } from '@nestjs/common';
import { ITEMS_SERVICE } from '../tokens';
import type { IItemsService } from '../ports/items.service.port';
import type { CreateItemDto } from '../../items/dto/create-item.dto';
import type { AuthenticatedRequest } from '../../shared/auth/types';
import type { ItemEntity } from '../../infra/postgres/entities/item.entity';

type AuthUser = AuthenticatedRequest['user'];

/**
 * AddItemToContainerUseCase
 *
 * Orchestrates adding an item to a container:
 * 1. Validates container ownership (delegated to ItemsService).
 * 2. Validates item type existence (delegated to ItemsService).
 * 3. Persists the new item.
 */
@Injectable()
export class AddItemToContainerUseCase {
  constructor(@Inject(ITEMS_SERVICE) private readonly itemsService: IItemsService) {}

  async execute(containerId: string, dto: CreateItemDto, user: AuthUser): Promise<ItemEntity> {
    return await this.itemsService.create(containerId, dto, user);
  }
}
