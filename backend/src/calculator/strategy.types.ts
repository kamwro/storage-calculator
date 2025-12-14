export type StrategyKey = 'first_fit' | 'best_fit' | 'single_container_only';

export interface ContainerState<C> {
  container: C;
  usedW: number;
  usedV: number;
  items: Map<string, number>;
}

export interface ItemTypeLike {
  id: string;
  unitWeightKg: number;
  unitVolumeM3: number;
}

export type StrategyFn<C> = (args: {
  state: ContainerState<C>[];
  typeMap: Map<string, ItemTypeLike>;
  typeId: string;
}) => ContainerState<C> | undefined;
