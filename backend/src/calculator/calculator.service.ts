import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import type { AuthenticatedRequest } from '../shared/auth/types';
import { EvaluateRequestDto } from './dto/evaluate.dto';
import { strategyMap } from './strategies';
import type { ContainerState } from './strategy.types';
type AuthUser = AuthenticatedRequest['user'];

type AllocationItem = { itemTypeId: string; quantity: number };

@Injectable()
export class CalculatorService {
  constructor(
    @InjectRepository(ContainerEntity)
    private readonly containersRepo: Repository<ContainerEntity>,
    @InjectRepository(ItemTypeEntity)
    private readonly itemTypesRepo: Repository<ItemTypeEntity>,
  ) {}

  async evaluate(input: EvaluateRequestDto, user: AuthUser) {
    if (!input.items?.length) throw new BadRequestException('items cannot be empty');
    if (!input.containers?.length) throw new BadRequestException('containers cannot be empty');

    const containers = await this.containersRepo.find({ where: { id: In(input.containers) } });
    if (containers.length !== input.containers.length) {
      throw new BadRequestException('One or more containers not found');
    }
    if (user.role !== 'admin') {
      const unauthorized = containers.find((c) => c.ownerId !== user.id);
      if (unauthorized) throw new ForbiddenException('You cannot use containers you do not own');
    }

    const itemTypeIds = Array.from(new Set(input.items.map((i) => i.itemTypeId)));
    const itemTypes = await this.itemTypesRepo.find({ where: { id: In(itemTypeIds) } });
    if (itemTypes.length !== itemTypeIds.length) {
      throw new BadRequestException('One or more item types not found');
    }
    const typeMap = new Map(itemTypes.map((t) => [t.id, t] as const));

    // Working state per container
    const state: ContainerState<ContainerEntity>[] = containers.map((c) => ({
      container: c,
      usedW: 0,
      usedV: 0,
      items: new Map<string, number>() as Map<string, number>,
    }));

    // Clone items demand
    const remaining: AllocationItem[] = input.items.map((i) => ({
      itemTypeId: i.itemTypeId,
      quantity: Math.floor(i.quantity),
    }));

    const placeUnit = (typeId: string, s: (typeof state)[number]) => {
      const t = typeMap.get(typeId)!;
      const newW = s.usedW + t.unitWeightKg;
      const newV = s.usedV + t.unitVolumeM3;
      if (newW > s.container.maxWeightKg || newV > s.container.maxVolumeM3) return false;
      s.usedW = newW;
      s.usedV = newV;
      s.items.set(typeId, (s.items.get(typeId) ?? 0) + 1);
      return true;
    };

    // Allocation
    const unallocated: AllocationItem[] = [];

    if (input.strategy === 'single_container_only') {
      // Try each container to fit all items entirely
      for (const s of state) {
        let ok = true;
        for (const dem of remaining) {
          const t = typeMap.get(dem.itemTypeId)!;
          const needW = t.unitWeightKg * dem.quantity;
          const needV = t.unitVolumeM3 * dem.quantity;
          if (s.usedW + needW > s.container.maxWeightKg || s.usedV + needV > s.container.maxVolumeM3) {
            ok = false;
            break;
          }
        }
        if (ok) {
          for (const dem of remaining) {
            const t = typeMap.get(dem.itemTypeId)!;
            s.usedW += t.unitWeightKg * dem.quantity;
            s.usedV += t.unitVolumeM3 * dem.quantity;
            s.items.set(dem.itemTypeId, (s.items.get(dem.itemTypeId) ?? 0) + dem.quantity);
          }
          return this.buildResult(state, []);
        }
      }
      // no fit
      return this.buildResult(state, remaining);
    }

    // For other strategies, allocate unit-by-unit for simplicity and determinism in demo
    for (const dem of remaining) {
      let q = dem.quantity;
      if (q <= 0) continue;
      while (q > 0) {
        const pickFn = strategyMap[input.strategy as 'first_fit' | 'best_fit'];
        const pick = pickFn
          ? (pickFn({ state, typeMap, typeId: dem.itemTypeId }) as (typeof state)[number] | undefined)
          : undefined;
        if (!pick) break; // cannot place more units of this type
        // place one unit
        placeUnit(dem.itemTypeId, pick);
        q -= 1;
      }
      if (q > 0) unallocated.push({ itemTypeId: dem.itemTypeId, quantity: q });
    }

    return this.buildResult(state, unallocated);
  }

  private buildResult(
    state: { container: ContainerEntity; usedW: number; usedV: number; items: Map<string, number> }[],
    unallocated: AllocationItem[],
  ) {
    const byContainer = state.map((s) => ({
      containerId: s.container.id,
      totalWeightKg: s.usedW,
      totalVolumeM3: s.usedV,
      utilization: {
        weightPct: s.container.maxWeightKg ? s.usedW / s.container.maxWeightKg : 0,
        volumePct: s.container.maxVolumeM3 ? s.usedV / s.container.maxVolumeM3 : 0,
      },
      items: Array.from(s.items.entries()).map(([itemTypeId, quantity]) => ({ itemTypeId, quantity })),
    }));
    const feasible = unallocated.length === 0;
    return { feasible, byContainer, unallocated };
  }
}
