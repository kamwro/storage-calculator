import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

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

  async listByContainer(containerId: string): Promise<ItemEntity[]> {
    await this.ensureContainer(containerId);
    return this.itemsRepo.find({ where: { container: { id: containerId } as any } });
  }

  async create(containerId: string, dto: CreateItemDto): Promise<ItemEntity> {
    const container = await this.ensureContainer(containerId);
    const itemType = await this.ensureItemType(dto.itemTypeId);
    const item = this.itemsRepo.create({
      container,
      itemType,
      quantity: dto.quantity,
      note: dto.note ?? null,
    });
    return this.itemsRepo.save(item);
  }

  async update(id: string, dto: UpdateItemDto): Promise<ItemEntity> {
    const item = await this.itemsRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (dto.itemTypeId) {
      const itemType = await this.ensureItemType(dto.itemTypeId);
      (item as any).itemType = itemType;
    }
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.note !== undefined) item.note = dto.note;
    return this.itemsRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    await this.itemsRepo.delete(id);
  }

  private async ensureContainer(id: string): Promise<ContainerEntity> {
    const container = await this.containersRepo.findOne({ where: { id } });
    if (!container) throw new NotFoundException('Container not found');
    return container;
  }

  private async ensureItemType(id: string): Promise<ItemTypeEntity> {
    const itemType = await this.itemTypesRepo.findOne({ where: { id } });
    if (!itemType) throw new NotFoundException('Item type not found');
    return itemType;
  }
}
