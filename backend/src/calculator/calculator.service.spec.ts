import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import type { Repository } from 'typeorm';

// Minimal types mirroring entities used inside the service
type Container = { id: string; name: string; maxWeightKg: number; maxVolumeM3: number; ownerId: string };
type ItemType = { id: string; name: string; unitWeightKg: number; unitVolumeM3: number };

describe('CalculatorService (access control + basics)', () => {
  let service: CalculatorService;
  let containersRepo: Partial<Repository<Container>> & { _data?: Container[] };
  let itemTypesRepo: Partial<Repository<ItemType>> & { _data?: ItemType[] };

  const c1: Container = { id: 'c1', name: 'C1', maxWeightKg: 100, maxVolumeM3: 1, ownerId: 'u1' };
  const c2: Container = { id: 'c2', name: 'C2', maxWeightKg: 100, maxVolumeM3: 1, ownerId: 'u2' };
  const t1: ItemType = { id: 't1', name: 'Small', unitWeightKg: 1, unitVolumeM3: 0.01 };

  beforeEach(() => {
    containersRepo = {
      _data: [c1, c2],
      find: jest.fn(async (opts?: any) => {
        if (!opts?.where?.id) return [...(containersRepo._data as Container[])];
        const idFilter = opts.where.id;
        const ids: string[] = idFilter?.value || idFilter?._value || idFilter || [];
        return (containersRepo._data as Container[]).filter((c) => ids.includes(c.id));
      }),
    } as any;

    itemTypesRepo = {
      _data: [t1],
      find: jest.fn(async (opts?: any) => {
        if (!opts?.where?.id) return [...(itemTypesRepo._data as ItemType[])];
        const idFilter = opts.where.id;
        const ids: string[] = idFilter?.value || idFilter?._value || idFilter || [];
        return (itemTypesRepo._data as ItemType[]).filter((t) => ids.includes(t.id));
      }),
    } as any;

    service = new CalculatorService(containersRepo as any, itemTypesRepo as any);
  });

  it('rejects when items array is empty', async () => {
    await expect(
      service.evaluate(
        { items: [], containers: ['c1'], strategy: 'first_fit' },
        { id: 'u1', username: 'u', role: 'user' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when containers array is empty', async () => {
    await expect(
      service.evaluate(
        { items: [{ itemTypeId: 't1', quantity: 1 }], containers: [], strategy: 'first_fit' },
        {
          id: 'u1',
          username: 'u',
          role: 'user',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('forbids non-admin using containers they do not own', async () => {
    await expect(
      service.evaluate(
        { items: [{ itemTypeId: 't1', quantity: 1 }], containers: ['c1', 'c2'], strategy: 'first_fit' },
        { id: 'u1', username: 'demo', role: 'user' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin to use any containers and produces a feasible allocation', async () => {
    const result = await service.evaluate(
      { items: [{ itemTypeId: 't1', quantity: 1 }], containers: ['c2'], strategy: 'first_fit' },
      { id: 'admin1', username: 'admin', role: 'admin' },
    );
    expect(result.feasible).toBe(true);
    expect(result.byContainer.some((r) => r.containerId === 'c2')).toBe(true);
  });
});
