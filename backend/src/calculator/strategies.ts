import type { ContainerState,StrategyFn } from './strategy.types';

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

export const strategyMap = {
  first_fit: firstFit,
  best_fit: bestFit,
};

export type StrategyMap = typeof strategyMap;
