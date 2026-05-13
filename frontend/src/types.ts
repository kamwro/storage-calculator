// ============= Domain Types =============

export type ItemType = {
  id: string;
  name: string;
  unitWeightKg: number;
  unitVolumeM3: number;
};

export type Container = {
  id: string;
  name: string;
  maxWeightKg: number;
  maxVolumeM3: number;
  isFavorite: boolean;
};

export type Item = {
  id: string;
  quantity: number;
  note?: string | null;
  itemType: ItemType;
};

export type User = {
  id: string;
  username: string;
  role: 'admin' | 'user';
};

export type AdminUser = {
  id: string;
  name: string;
  role: 'admin' | 'user';
};

// ============= API Response Types =============

export type ContainerSummary = {
  containerId: string;
  totalWeightKg: number;
  totalVolumeM3: number;
  maxWeightKg: number;
  maxVolumeM3: number;
  utilization?: {
    weightPct: number;
    volumePct: number;
  };
  weightExceeded: boolean;
  volumeExceeded: boolean;
};

export type PackingStrategy = 'first_fit' | 'best_fit' | 'best_fit_decreasing' | 'single_container_only';

export type CalculatorRequest = {
  items: Array<{
    itemTypeId: string;
    quantity: number;
  }>;
  containers: string[];
  strategy: PackingStrategy;
};

export type CalculatorResult = {
  feasible: boolean;
  byContainer: Array<{
    containerId: string;
    totalWeightKg: number;
    totalVolumeM3: number;
    utilization: {
      weightPct: number;
      volumePct: number;
    };
    items: Array<{
      itemTypeId: string;
      quantity: number;
    }>;
  }>;
  unallocated: Array<{
    itemTypeId: string;
    quantity: number;
  }>;
};

// ============= Form Payload Types =============

export type CreateContainerPayload = {
  name: string;
  maxWeightKg: number;
  maxVolumeM3: number;
  isFavorite: boolean;
};

export type CreateItemTypePayload = {
  name: string;
  unitWeightKg: number;
  unitVolumeM3: number;
};

export type CreateItemPayload = {
  itemTypeId: string;
  quantity: number;
  note?: string;
};

export type UpdateItemPayload = {
  quantity: number;
};
