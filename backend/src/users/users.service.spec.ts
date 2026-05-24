import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Repository } from 'typeorm';
import { UserEntity } from '../infra/postgres/entities/user.entity';

type SafeUser = Pick<UserEntity, 'id' | 'name' | 'role'>;

describe('UsersService', () => {
  let service: UsersService;
  let repo: Partial<Repository<UserEntity>> & { _data: UserEntity[] };

  const u1: UserEntity = { id: 'u1', name: 'alice', password: 'hash1', role: 'admin' };
  const u2: UserEntity = { id: 'u2', name: 'bob', password: 'hash2', role: 'user' };

  beforeEach(() => {
    repo = {
      _data: [u1, u2],
      find: jest.fn(async (opts?: any) => {
        const data = [...repo._data];
        const sel: Record<string, boolean> | undefined = opts?.select;
        if (!sel) return data;
        return data.map((u) => {
          const out: any = {};
          for (const k of Object.keys(sel) as Array<keyof UserEntity>) {
            if (sel[k]) out[k] = u[k];
          }
          return out as SafeUser;
        });
      }),
      findOne: jest.fn(async (opts: any) => {
        const id: string | undefined = opts?.where?.id;
        const name: string | undefined = opts?.where?.name;
        if (id) return repo._data.find((u) => u.id === id) ?? null;
        if (name) return repo._data.find((u) => u.name === name) ?? null;
        return null;
      }),
      create: jest.fn((partial: Partial<UserEntity>) => partial as UserEntity),
      save: jest.fn(async (entity: UserEntity) => entity),
      delete: jest.fn(async (id: string) => {
        repo._data = repo._data.filter((u) => u.id !== id);
      }),
    } as any;

    service = new UsersService(repo as any);
  });

  describe('findAll', () => {
    it('returns id, name, and role for every user', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('role');
    });

    it('does not expose the password hash', async () => {
      const result = await service.findAll();
      result.forEach((u) => expect(u).not.toHaveProperty('password'));
    });
  });

  describe('findById', () => {
    it('returns the matching user', async () => {
      const result = await service.findById('u1');
      expect(result?.name).toBe('alice');
    });

    it('returns null for an unknown id', async () => {
      expect(await service.findById('unknown')).toBeNull();
    });
  });

  describe('findByName', () => {
    it('returns the matching user', async () => {
      const result = await service.findByName('bob');
      expect(result?.id).toBe('u2');
    });

    it('returns null for an unknown name', async () => {
      expect(await service.findByName('nobody')).toBeNull();
    });
  });

  describe('remove', () => {
    it('deletes an existing user', async () => {
      await service.remove('u2', 'u1');
      expect(repo._data.find((u) => u.id === 'u2')).toBeUndefined();
    });

    it('throws NotFoundException for an unknown id', async () => {
      await expect(service.remove('unknown', 'u1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when requester tries to delete themselves', async () => {
      await expect(service.remove('u1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('does not delete the requester when deleting a different user', async () => {
      await service.remove('u2', 'u1');
      expect(repo._data.find((u) => u.id === 'u1')).toBeDefined();
    });
  });
});
