import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import type { AuthenticatedRequest } from '../shared/auth/types';
import type { IContainersService } from '../core/ports/containers.service.port';
import { PaginationQueryDto, PaginatedResponse } from '../shared/dto/pagination.dto';
import { buildOrder, toPaginatedResponse } from '../shared/pagination/pagination.util';
type AuthUser = AuthenticatedRequest['user'];

/**
 * ContainersService
 *
 * Provides CRUD operations for containers and calculates utilization
 * based on items within a container for a given user.
 */
@Injectable()
export class ContainersService implements IContainersService {
  constructor(
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemsRepo: Repository<ItemEntity>,
  ) {}

  /**
   * List containers visible to the user. Overloaded to support optional pagination.
   */
  async findAll(user: AuthUser): Promise<ContainerEntity[]>;
  async findAll(user: AuthUser, q: PaginationQueryDto): Promise<PaginatedResponse<ContainerEntity>>;
  async findAll(user: AuthUser, q?: PaginationQueryDto): Promise<ContainerEntity[] | PaginatedResponse<ContainerEntity>> {
    const where = user.role === 'admin' ? {} : ({ ownerId: user.id } as any);
    if (!q) {
      return this.containersRepo.find({ where });
    }
    const order = buildOrder<ContainerEntity>(['name', 'maxWeightKg', 'maxVolumeM3', 'id'], q.sort, q.dir);
    const [data, total] = await this.containersRepo.findAndCount({
      where,
      order,
      skip: q.offset ?? 0,
      take: q.limit ?? 20,
    });
    return toPaginatedResponse(data, total, q.offset ?? 0, q.limit ?? 20);
  }

  /**
   * Fetch a container by id; validates existence and optionally ownership (unless admin).
   * @throws NotFoundException when container does not exist
   * @throws ForbiddenException when user does not own the container
   */
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

  /**
   * Create a container owned by the given user.
   */
  async create(dto: CreateContainerDto, user: AuthUser): Promise<ContainerEntity> {
    const container = this.containersRepo.create({ ...dto, ownerId: user.id });
    return this.containersRepo.save(container);
  }

  /**
   * Update an existing container after ownership check.
   */
  async update(id: string, dto: UpdateContainerDto, user: AuthUser): Promise<ContainerEntity> {
    const container = await this.findOne(id, user);
    Object.assign(container, dto);
    return this.containersRepo.save(container);
  }

  /**
   * Delete a container after ownership check.
   */
  async remove(id: string, user: AuthUser): Promise<void> {
    const container = await this.findOne(id, user);
    await this.containersRepo.delete(container.id);
  }

  /**
   * Calculate utilization for a container based on its current items.
   */
  async calculate(id: string, user: AuthUser) {
    const container = await this.findOne(id, user);

    const items = await this.itemsRepo.find({ where: { container: { id } } });

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
      utilization: {
        weightPct: container.maxWeightKg ? totalWeightKg / container.maxWeightKg : 0,
        volumePct: container.maxVolumeM3 ? totalVolumeM3 / container.maxVolumeM3 : 0,
      },
      weightExceeded: totalWeightKg > container.maxWeightKg,
      volumeExceeded: totalVolumeM3 > container.maxVolumeM3,
    };
  }
}
