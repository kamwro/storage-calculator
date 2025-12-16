import type { EvaluateRequestDto } from '../../calculator/dto/evaluate.dto';
import type { AuthenticatedRequest } from '../../shared/auth/types';

type AuthUser = AuthenticatedRequest['user'];

export interface ICalculatorService {
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
