import type { PaginationQueryDto, PaginatedResponse } from '../../shared/dto/pagination.dto';
import type { ContainerEntity } from '../../infra/postgres/entities/container.entity';
import type { AuthenticatedRequest } from '../../shared/auth/types';
import type { CreateContainerDto } from '../../containers/dto/create-container.dto';
import type { UpdateContainerDto } from '../../containers/dto/update-container.dto';

type AuthUser = AuthenticatedRequest['user'];

/**
 * Port for container-related operations including CRUD and utilization calculation.
 *
 * Implementations must enforce authorization based on the provided `user`.
 */
export interface IContainersService {
  /**
   * List containers visible to the user.
   * @param user Auth context used for ownership filtering
   */
  findAll(user: AuthUser): Promise<ContainerEntity[]>;
  /**
   * Paginated version of `findAll`.
   * @param user Auth context used for ownership filtering
   * @param q Pagination and sorting parameters
   */
  findAll(user: AuthUser, q: PaginationQueryDto): Promise<PaginatedResponse<ContainerEntity>>;
  /**
   * Fetch a single container by id; may throw NotFound/Forbidden.
   */
  findOne(id: string, user?: AuthUser): Promise<ContainerEntity>;
  /**
   * Create a container owned by the user.
   */
  create(dto: CreateContainerDto, user: AuthUser): Promise<ContainerEntity>;
  /**
   * Update a container after ownership check.
   */
  update(id: string, dto: UpdateContainerDto, user: AuthUser): Promise<ContainerEntity>;
  /**
   * Delete a container after ownership check.
   */
  remove(id: string, user: AuthUser): Promise<void>;
  /**
   * Calculate current utilization based on items inside the container.
   */
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
