import type { EvaluateRequestDto } from '../../calculator/dto/evaluate.dto';
import type { AuthenticatedRequest } from '../../shared/auth/types';

type AuthUser = AuthenticatedRequest['user'];

export interface ICalculatorService {
  /**
   * Evaluate an allocation strategy for the requested items against a set of containers.
   *
   * @param input Request payload describing demanded items, candidate containers and strategy key
   * @param user Authenticated user whose access context is used for authorization
   * @returns Result describing feasibility, per-container utilization and any unallocated items
   */
  evaluate(
    input: EvaluateRequestDto,
    user: AuthUser,
  ): Promise<{
    feasible: boolean;
    byContainer: Array<{
      containerId: string;
      totalWeightKg: number;
      totalVolumeM3: number;
      utilization: { weightPct: number; volumePct: number };
      items: Array<{ itemTypeId: string; quantity: number }>;
    }>;
    unallocated: Array<{ itemTypeId: string; quantity: number }>;
  }>;
}
