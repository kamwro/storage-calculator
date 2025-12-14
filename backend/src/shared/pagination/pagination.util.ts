import type { FindManyOptions } from 'typeorm';

export type OrderDirection = 'ASC' | 'DESC';

export function buildOrder<T>(
  allowed: (keyof T & string)[],
  sort?: string,
  dir: 'asc' | 'desc' = 'asc',
): FindManyOptions<T>['order'] {
  if (!sort) return undefined;
  if (!allowed.includes(sort as any)) return undefined;
  const direction: OrderDirection = dir === 'desc' ? 'DESC' : 'ASC';
  return { [sort]: direction } as any;
}

export function toPaginatedResponse<T>(data: T[], total: number, offset = 0, limit = 20) {
  return { data, total, offset, limit };
}
