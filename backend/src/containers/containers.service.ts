import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import type { AuthenticatedRequest } from '../shared/auth/types';
type AuthUser = AuthenticatedRequest['user'];

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemsRepo: Repository<ItemEntity>,
  ) {}

  findAll(user: AuthUser): Promise<ContainerEntity[]> {
    if (user.role === 'admin') return this.containersRepo.find();
    return this.containersRepo.find({ where: { ownerId: user.id } as any });
  }

  async findOne(id: string, user?: AuthUser): Promise<ContainerEntity> {
    const container = await this.containersRepo.findOne({ where: { id } });
    if (!container) {
      throw new NotFoundException('Container not found');
    }
    if (user && user.role !== 'admin' && container.ownerId !== user.id) {
      throw new ForbiddenException('Not your container');
    }
    return container;
  }

  async create(dto: CreateContainerDto, user: AuthUser): Promise<ContainerEntity> {
    const container = this.containersRepo.create({ ...dto, ownerId: user.id });
    return this.containersRepo.save(container);
  }

  async update(id: string, dto: UpdateContainerDto, user: AuthUser): Promise<ContainerEntity> {
    const container = await this.findOne(id, user);
    Object.assign(container, dto);
    return this.containersRepo.save(container);
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const container = await this.findOne(id, user);
    await this.containersRepo.delete(container.id);
  }

  async calculate(id: string, user: AuthUser) {
    const container = await this.findOne(id, user);

    const items = await this.itemsRepo.find({ where: { container: { id } as any } });

    let totalWeightKg = 0;
    let totalVolumeM3 = 0;

    for (const item of items) {
      // itemType is eager-loaded on ItemEntity
      const unitW = item.itemType.unitWeightKg;
      const unitV = item.itemType.unitVolumeM3;
      totalWeightKg += item.quantity * unitW;
      totalVolumeM3 += item.quantity * unitV;
    }

    return {
      containerId: container.id,
      totalWeightKg,
      totalVolumeM3,
      maxWeightKg: container.maxWeightKg,
      maxVolumeM3: container.maxVolumeM3,
      weightExceeded: totalWeightKg > container.maxWeightKg,
      volumeExceeded: totalVolumeM3 > container.maxVolumeM3,
    };
  }
}
