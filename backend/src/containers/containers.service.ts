import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { ItemTypesService } from '../item-types/item-types.service';

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    private readonly itemTypesService: ItemTypesService,
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

    let totalWeight = 0;
    let totalVolume = 0;

    for (const item of container.items) {
      const itemType = await this.itemTypesService.findById(item.itemTypeId);
      totalWeight += item.quantity * itemType.weightPerKg;
      totalVolume += item.quantity * itemType.volumePerM3;
    }

    return {
      containerId: container.id,
      totalWeight,
      totalVolume,
      maxWeight: container.maxWeight,
      maxVolume: container.maxVolume,
      weightExceeded: totalWeight > container.maxWeight,
      volumeExceeded: totalVolume > container.maxVolume,
    };
  }
}
