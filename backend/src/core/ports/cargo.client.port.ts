export interface NormalizeResultItemTypeInput {
  name: string;
  unitWeightKg: number;
  unitVolumeM3: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
}

export interface NormalizeResultItemInput {
  itemTypeName: string;
  quantity: number;
}

export interface NormalizeResult {
  itemTypes: NormalizeResultItemTypeInput[];
  items: NormalizeResultItemInput[];
}

export interface ICargoClient {
  health(): Promise<{ ok: boolean } | null>;
  normalize(source: string, payload: unknown): Promise<NormalizeResult>;
}
