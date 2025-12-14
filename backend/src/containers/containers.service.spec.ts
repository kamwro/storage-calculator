import { ForbiddenException } from '@nestjs/common';
import { ContainersService } from './containers.service';
import type { Repository } from 'typeorm';

type Container = { id: string; name: string; maxWeightKg: number; maxVolumeM3: number; ownerId: string };

describe('ContainersService (ownership scoping)', () => {
  let service: ContainersService;
  let containersRepo: Partial<Repository<Container>> & { _data: Container[] };

  const c1: Container = { id: 'c1', name: 'A', maxWeightKg: 100, maxVolumeM3: 1, ownerId: 'u1' };
  const c2: Container = { id: 'c2', name: 'B', maxWeightKg: 200, maxVolumeM3: 2, ownerId: 'u2' };

  beforeEach(() => {
    containersRepo = {
      _data: [c1, c2],
      find: jest.fn(async (opts?: any) => {
        if (!opts?.where) return [...containersRepo._data];
        if (opts.where.ownerId) return containersRepo._data.filter((c) => c.ownerId === opts.where.ownerId);
        return [...containersRepo._data];
      }),
      findOne: jest.fn(async (opts: any) => {
        const id = opts?.where?.id ?? opts?.where?.id;
        return containersRepo._data.find((c) => c.id === id) ?? null;
      }),
      create: jest.fn((partial: Partial<Container>) => partial as Container),
      save: jest.fn(async (entity: any) => {
        const existingIdx = containersRepo._data.findIndex((c) => c.id === entity.id);
        if (existingIdx >= 0)
          containersRepo._data[existingIdx] = { ...(containersRepo._data[existingIdx] as any), ...entity };
        else containersRepo._data.push(entity as Container);
        return entity as Container;
      }),
      delete: jest.fn(async (id: string) => {
        containersRepo._data = containersRepo._data.filter((c) => c.id !== id);
      }),
    } as any;

    // Items repo not used in these tests, provide a minimal stub
    const itemsRepo: any = {};

    service = new ContainersService(containersRepo as any, itemsRepo);
  });

  it('findAll returns all for admin, owner-only for user', async () => {
    const admin = { id: 'admin', username: 'a', role: 'admin' } as const;
    const user = { id: 'u1', username: 'u', role: 'user' } as const;
    const all = await service.findAll(admin as any);
    const owned = await service.findAll(user as any);
    expect(all).toHaveLength(2);
    expect(owned).toHaveLength(1);
    expect(owned[0].id).toBe('c1');
  });

  it('findOne forbids access to non-owned container for user', async () => {
    const user = { id: 'u1', username: 'u', role: 'user' } as const;
    await expect(service.findOne('c2', user as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('create sets ownerId to the current user', async () => {
    const user = { id: 'u3', username: 'u', role: 'user' } as const;
    const created = await service.create({ name: 'C3', maxWeightKg: 50, maxVolumeM3: 0.5 }, user as any);
    expect(created.ownerId).toBe('u3');
  });
});
