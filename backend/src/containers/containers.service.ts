import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { ItemEntity } from '../infra/postgres/entities/item.entity';

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemsRepo: Repository<ItemEntity>,
  ) {}

  findAll(): Promise<ContainerEntity[]> {
    return this.containersRepo.find();
  }

  async findOne(id: string): Promise<ContainerEntity> {
    const container = await this.containersRepo.findOne({ where: { id } });
    if (!container) {
      throw new NotFoundException('Container not found');
    }
    return container;
  }

  async create(dto: CreateContainerDto): Promise<ContainerEntity> {
    const container = this.containersRepo.create(dto);
    return this.containersRepo.save(container);
  }

  async update(id: string, dto: UpdateContainerDto): Promise<ContainerEntity> {
    const container = await this.findOne(id);
    Object.assign(container, dto);
    return this.containersRepo.save(container);
  }

  async remove(id: string): Promise<void> {
    await this.containersRepo.delete(id);
  }

  async calculate(id: string) {
    const container = await this.findOne(id);

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
