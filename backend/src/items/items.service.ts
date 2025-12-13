import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import type { AuthenticatedRequest } from '../shared/auth/types';
type AuthUser = AuthenticatedRequest['user'];

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepo: Repository<ItemEntity>,
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    @InjectRepository(ItemTypeEntity)
    private readonly itemTypesRepo: Repository<ItemTypeEntity>,
  ) {}

  async listByContainer(containerId: string, user: AuthUser): Promise<ItemEntity[]> {
    await this.ensureContainer(containerId, user);
    return this.itemsRepo.find({ where: { container: { id: containerId } } });
  }

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

  async remove(id: string, user: AuthUser): Promise<void> {
    const item = await this.itemsRepo.findOne({ where: { id }, relations: ['container'] });
    if (!item) return;
    await this.ensureContainer(item.container.id, user);
    await this.itemsRepo.delete(id);
  }

  private async ensureContainer(id: string, user: AuthUser): Promise<ContainerEntity> {
    const container = await this.containersRepo.findOne({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    if (user.role !== 'admin' && container.ownerId !== user.id) {
      throw new ForbiddenException('Not your container');
    }
    return container;
  }

  private async ensureItemType(id: string): Promise<ItemTypeEntity> {
    const itemType = await this.itemTypesRepo.findOne({ where: { id } });
    if (!itemType) throw new NotFoundException('Item type not found');
    return itemType;
  }
}
