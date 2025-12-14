import { ForbiddenException } from '@nestjs/common';
import { ItemsService } from './items.service';
import type { Repository } from 'typeorm';

type Container = { id: string; ownerId: string; name: string; maxWeightKg: number; maxVolumeM3: number };
type ItemType = { id: string; name: string; unitWeightKg: number; unitVolumeM3: number };
type Item = { id: string; container: Container; itemType: ItemType; quantity: number; note?: string | null };

describe('ItemsService (ownership scoping)', () => {
  let service: ItemsService;
  let itemsRepo: Partial<Repository<Item>> & { _data: Item[] };
  let containersRepo: Partial<Repository<Container>> & { _data: Container[] };
  let itemTypesRepo: Partial<Repository<ItemType>> & { _data: ItemType[] };

  const cont1: Container = { id: 'c1', ownerId: 'u1', name: 'C1', maxWeightKg: 100, maxVolumeM3: 1 };
  const cont2: Container = { id: 'c2', ownerId: 'u2', name: 'C2', maxWeightKg: 100, maxVolumeM3: 1 };
  const t1: ItemType = { id: 't1', name: 'Small', unitWeightKg: 1, unitVolumeM3: 0.01 };

  beforeEach(() => {
    itemsRepo = {
      _data: [],
      find: jest.fn(async (opts?: any) => {
        const id = opts?.where?.container?.id;
        return (itemsRepo._data as Item[]).filter((i) => (id ? i.container.id === id : true));
      }),
      findOne: jest.fn(async (opts: any) => {
        const id = opts?.where?.id ?? opts?.where?.id;
        const rels = opts?.relations ?? [];
        const item = (itemsRepo._data as Item[]).find((i) => i.id === id);
        if (!item) return null;
        // naive: relations already present on our object
        return item;
      }),
      create: jest.fn((partial: Partial<Item>) => partial as Item),
      save: jest.fn(async (entity: any) => {
        if (!entity.id) entity.id = `it-${(itemsRepo._data.length + 1).toString()}`;
        const idx = itemsRepo._data.findIndex((i) => i.id === entity.id);
        if (idx >= 0) itemsRepo._data[idx] = { ...(itemsRepo._data[idx] as any), ...entity } as Item;
        else itemsRepo._data.push(entity as Item);
        return entity as Item;
      }),
      delete: jest.fn(async (id: string) => {
        itemsRepo._data = itemsRepo._data.filter((i) => i.id !== id);
      }),
    } as any;

    containersRepo = {
      _data: [cont1, cont2],
      findOne: jest.fn(async (opts: any) => {
        const id = opts?.where?.id ?? opts?.where?.id;
        return (containersRepo._data as Container[]).find((c) => c.id === id) ?? null;
      }),
    } as any;

    itemTypesRepo = {
      _data: [t1],
      findOne: jest.fn(async (opts: any) => {
        const id = opts?.where?.id ?? opts?.where?.id;
        return (itemTypesRepo._data as ItemType[]).find((t) => t.id === id) ?? null;
      }),
    } as any;

    service = new ItemsService(itemsRepo as any, containersRepo as any, itemTypesRepo as any);
  });

  it('listByContainer: forbids when user does not own container', async () => {
    await expect(service.listByContainer('c2', { id: 'u1', username: 'u', role: 'user' } as any)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('listByContainer: returns items for owner', async () => {
    itemsRepo._data.push({ id: 'i1', container: cont1, itemType: t1, quantity: 2 });
    const res = await service.listByContainer('c1', { id: 'u1', username: 'u', role: 'user' } as any);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('i1');
  });

  it('create: forbids when container not owned by user', async () => {
    await expect(
      service.create('c2', { itemTypeId: 't1', quantity: 3 }, { id: 'u1', username: 'u', role: 'user' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('create: creates item for owner with default note null', async () => {
    const item = await service.create('c1', { itemTypeId: 't1', quantity: 3 }, {
      id: 'u1',
      username: 'u',
      role: 'user',
    } as any);
    expect(item.container.id).toBe('c1');
    expect(item.itemType.id).toBe('t1');
    expect(item.quantity).toBe(3);
    expect(item.note ?? null).toBeNull();
  });

  it('update: forbids when item belongs to another users container', async () => {
    itemsRepo._data.push({ id: 'i2', container: cont2, itemType: t1, quantity: 1 });
    await expect(
      service.update('i2', { quantity: 5 }, { id: 'u1', username: 'u', role: 'user' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('remove: forbids when item belongs to another users container', async () => {
    itemsRepo._data.push({ id: 'i3', container: cont2, itemType: t1, quantity: 1 });
    await expect(service.remove('i3', { id: 'u1', username: 'u', role: 'user' } as any)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
