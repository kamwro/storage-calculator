import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import type { AuthenticatedRequest } from '../shared/auth/types';
import { PaginationQueryDto, PaginatedResponse } from '../shared/dto/pagination.dto';
import { buildOrder, toPaginatedResponse } from '../shared/pagination/pagination.util';
import type { IItemsService } from '../core/ports/items.service.port';
type AuthUser = AuthenticatedRequest['user'];

/**
 * ItemsService
 *
 * Manages CRUD operations for items inside containers, with access control
 * checks and optional pagination helpers.
 */
@Injectable()
export class ItemsService implements IItemsService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepo: Repository<ItemEntity>,
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    @InjectRepository(ItemTypeEntity)
    private readonly itemTypesRepo: Repository<ItemTypeEntity>,
  ) {}

  /**
   * List items in a container. Overloaded to support optional pagination.
   */
  async listByContainer(containerId: string, user: AuthUser): Promise<ItemEntity[]>;
  async listByContainer(
    containerId: string,
    q: PaginationQueryDto,
    user: AuthUser,
  ): Promise<PaginatedResponse<ItemEntity>>;
  async listByContainer(
    containerId: string,
    qOrUser: PaginationQueryDto | AuthUser,
    maybeUser?: AuthUser,
  ): Promise<ItemEntity[] | PaginatedResponse<ItemEntity>> {
    const hasPagination = !!maybeUser;
    const user = (hasPagination ? maybeUser : (qOrUser as AuthUser)) as AuthUser;
    await this.ensureContainer(containerId, user);
    const where = { container: { id: containerId } } as any;
    if (!hasPagination) {
      return this.itemsRepo.find({ where });
    }
    const q = qOrUser as PaginationQueryDto;
    const order = buildOrder<ItemEntity>(['quantity', 'id'], q.sort, q.dir);
    const [data, total] = await this.itemsRepo.findAndCount({ where, order, skip: q.offset ?? 0, take: q.limit ?? 20 });
    return toPaginatedResponse(data, total, q.offset ?? 0, q.limit ?? 20);
  }

  /**
   * Create a new item inside the specified container after access check.
   * @throws NotFoundException when container or item type does not exist
   * @throws ForbiddenException when user does not own the container
   */
  async create(containerId: string, dto: CreateItemDto, user: AuthUser): Promise<ItemEntity> {
    const container = await this.ensureContainer(containerId, user);
    const itemType = await this.ensureItemType(dto.itemTypeId);
    const item = this.itemsRepo.create({
      container,
      itemType,
      quantity: dto.quantity,
      note: dto.note ?? null,
    });
    return this.itemsRepo.save(item);
  }

  /**
   * Update an existing item, optionally changing its type/quantity/note.
   * @throws NotFoundException when item or new item type does not exist
   * @throws ForbiddenException when user does not own the container
   */
  async update(id: string, dto: UpdateItemDto, user: AuthUser): Promise<ItemEntity> {
    const item = await this.itemsRepo.findOne({ where: { id }, relations: ['container'] });
    if (!item) throw new NotFoundException('Item not found');
    await this.ensureContainer(item.container.id, user);
    if (dto.itemTypeId) {
      const itemType = await this.ensureItemType(dto.itemTypeId);
      item.itemType = itemType;
    }
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.note !== undefined) item.note = dto.note;
    return this.itemsRepo.save(item);
  }

  /**
   * Remove an item after verifying container ownership.
   */
  async remove(id: string, user: AuthUser): Promise<void> {
    const item = await this.itemsRepo.findOne({ where: { id }, relations: ['container'] });
    if (!item) return;
    await this.ensureContainer(item.container.id, user);
    await this.itemsRepo.delete(id);
  }

  /**
   * Ensure the container exists and is visible to the user.
   */
  private async ensureContainer(id: string, user: AuthUser): Promise<ContainerEntity> {
    const container = await this.containersRepo.findOne({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    if (user.role !== 'admin' && container.ownerId !== user.id) {
      throw new ForbiddenException('Not your container');
    }
    return container;
  }

  /**
   * Ensure the item type exists.
   */
  private async ensureItemType(id: string): Promise<ItemTypeEntity> {
    const itemType = await this.itemTypesRepo.findOne({ where: { id } });
    if (!itemType) throw new NotFoundException('Item type not found');
    return itemType;
  }
}
