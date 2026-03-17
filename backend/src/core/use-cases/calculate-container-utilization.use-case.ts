import { Inject, Injectable } from '@nestjs/common';
import { CONTAINERS_SERVICE } from '../tokens';
import type { IContainersService } from '../ports/containers.service.port';
import type { AuthenticatedRequest } from '../../shared/auth/types';

type AuthUser = AuthenticatedRequest['user'];

export interface CalculateContainerUtilizationOutput {
  containerId: string;
  totalWeightKg: number;
  totalVolumeM3: number;
  maxWeightKg: number;
  maxVolumeM3: number;
  utilization: {
    weightPct: number;
    volumePct: number;
  };
  weightExceeded: boolean;
  volumeExceeded: boolean;
}

/**
 * CalculateContainerUtilizationUseCase
 *
 * Orchestrates the calculation of container utilization:
 * 1. Fetches the container (validating existence and ownership).
 * 2. Delegates the calculation logic to the ContainersService (or a domain service).
 *
 * This separates the intention (calculate) from the implementation (how to sum weights/volumes).
 */
@Injectable()
export class CalculateContainerUtilizationUseCase {
  constructor(@Inject(CONTAINERS_SERVICE) private readonly containersService: IContainersService) {}

  async execute(containerId: string, user: AuthUser): Promise<CalculateContainerUtilizationOutput> {
    // The ContainersService already handles existence and ownership checks in its calculate method.
    // If we wanted to be more explicit, we could call findOne here, but calculate already does it.
    return await this.containersService.calculate(containerId, user);
  }
}
