import type { PaginationQueryDto, PaginatedResponse } from '../../shared/dto/pagination.dto';
import type { ContainerEntity } from '../../infra/postgres/entities/container.entity';
import type { AuthenticatedRequest } from '../../shared/auth/types';
import type { CreateContainerDto } from '../../containers/dto/create-container.dto';
import type { UpdateContainerDto } from '../../containers/dto/update-container.dto';

type AuthUser = AuthenticatedRequest['user'];

export interface IContainersService {
  findAll(user: AuthUser): Promise<ContainerEntity[]>;
  findAll(user: AuthUser, q: PaginationQueryDto): Promise<PaginatedResponse<ContainerEntity>>;
  findOne(id: string, user?: AuthUser): Promise<ContainerEntity>;
  create(dto: CreateContainerDto, user: AuthUser): Promise<ContainerEntity>;
  update(id: string, dto: UpdateContainerDto, user: AuthUser): Promise<ContainerEntity>;
  remove(id: string, user: AuthUser): Promise<void>;
  calculate(
    id: string,
    user: AuthUser,
  ): Promise<{
    containerId: string;
    totalWeightKg: number;
    totalVolumeM3: number;
    maxWeightKg: number;
    maxVolumeM3: number;
    utilization: { weightPct: number; volumePct: number };
    weightExceeded: boolean;
    volumeExceeded: boolean;
  }>;
}
