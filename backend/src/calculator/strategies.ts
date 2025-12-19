import type { ContainerState, StrategyFn } from './strategy.types';

/**
 * First-Fit strategy: pick the first container that can accommodate one more unit
 * of the requested item type without exceeding weight/volume limits.
 */
export const firstFit: StrategyFn<{
  maxWeightKg: number;
  maxVolumeM3: number;
}> = ({ state, typeMap, typeId }) => {
  const t = typeMap.get(typeId);
  if (!t) return undefined;
  for (const s of state) {
    const newW = s.usedW + t.unitWeightKg;
    const newV = s.usedV + t.unitVolumeM3;
    if (newW <= s.container.maxWeightKg && newV <= s.container.maxVolumeM3) {
      return s;
    }
  }
  return undefined;
};

/**
 * Best-Fit strategy: among containers that can still accept a unit, pick the one
 * with the smallest remaining capacity (by worst of weight/volume) after placement.
 */
export const bestFit: StrategyFn<{
  maxWeightKg: number;
  maxVolumeM3: number;
}> = ({ state, typeMap, typeId }) => {
  const t = typeMap.get(typeId);
  if (!t) return undefined;
  let best: ContainerState<{ maxWeightKg: number; maxVolumeM3: number }> | undefined;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const s of state) {
    const newW = s.usedW + t.unitWeightKg;
    const newV = s.usedV + t.unitVolumeM3;
    if (newW > s.container.maxWeightKg || newV > s.container.maxVolumeM3) continue;
    const remW = (s.container.maxWeightKg - newW) / s.container.maxWeightKg;
    const remV = (s.container.maxVolumeM3 - newV) / s.container.maxVolumeM3;
    const score = Math.max(remW, remV);
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
};

/**
 * Map of supported strategy keys to their implementation functions.
 */
export const strategyMap = {
  first_fit: firstFit,
  best_fit: bestFit,
};

/**
 * Type representing the `strategyMap` structure.
 */
export type StrategyMap = typeof strategyMap;
