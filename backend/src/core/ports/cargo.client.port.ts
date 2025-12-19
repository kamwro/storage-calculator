/**
 * A normalized definition of an item type as returned by the cargo client.
 */
export interface NormalizeResultItemTypeInput {
  name: string;
  unitWeightKg: number;
  unitVolumeM3: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
}

/**
 * A normalized item reference pointing to an item type by its name.
 */
export interface NormalizeResultItemInput {
  itemTypeName: string;
  quantity: number;
}

/**
 * Combined normalization result containing new/updated item types and items.
 */
export interface NormalizeResult {
  itemTypes: NormalizeResultItemTypeInput[];
  items: NormalizeResultItemInput[];
}

/**
 * Port describing an external cargo client capable of health checks and payload normalization.
 */
export interface ICargoClient {
  health(): Promise<{ ok: boolean } | null>;
  normalize(source: string, payload: unknown): Promise<NormalizeResult>;
}
