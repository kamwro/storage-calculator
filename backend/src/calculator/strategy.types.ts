/**
 * Allowed allocation strategy keys.
 */
export type StrategyKey = 'first_fit' | 'best_fit' | 'best_fit_decreasing' | 'bfd' | 'single_container_only';

/**
 * Mutable working state maintained per container during evaluation.
 * @template C Container shape carrying capacity fields used by strategies
 */
export interface ContainerState<C> {
  /** The underlying container domain object */
  container: C;
  /** Accumulated weight already placed (kg) */
  usedW: number;
  /** Accumulated volume already placed (m^3) */
  usedV: number;
  /** Map of itemTypeId to allocated quantity */
  items: Map<string, number>;
}

/**
 * Minimal shape of an item type used by evaluation logic.
 */
export interface ItemTypeLike {
  id: string;
  unitWeightKg: number;
  unitVolumeM3: number;
}

/**
 * Function that selects a container to place a single unit of `typeId`.
 * Returns the chosen container state or `undefined` if it cannot be placed.
 * @template C Container type carrying capacity fields (e.g., maxWeightKg/maxVolumeM3)
 */
export type StrategyFn<C> = (args: {
  /** Current states of all candidate containers */
  state: ContainerState<C>[];
  /** Lookup of item types referenced by demand lines */
  typeMap: Map<string, ItemTypeLike>;
  /** Item type identifier to be placed */
  typeId: string;
}) => ContainerState<C> | undefined;
