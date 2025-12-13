import 'reflect-metadata';
import { AppDataSource } from '../infra/postgres/data-source';
import { Repository } from 'typeorm';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { UserEntity } from '../infra/postgres/entities/user.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  const itemTypesRepo: Repository<ItemTypeEntity> = AppDataSource.getRepository(ItemTypeEntity);
  const containersRepo: Repository<ContainerEntity> = AppDataSource.getRepository(ContainerEntity);
  const itemsRepo: Repository<ItemEntity> = AppDataSource.getRepository(ItemEntity);
  const usersRepo: Repository<UserEntity> = AppDataSource.getRepository(UserEntity);

  // Clear existing (dev only)
  await itemsRepo.delete({});
  await containersRepo.delete({});
  await itemTypesRepo.delete({});
  await usersRepo.delete({});

  // Users (bcrypt hashed passwords, roles)
  const admin = usersRepo.create({
    name: 'admin@example.com',
    password: await bcrypt.hash('admin1234', 10),
    role: 'admin',
  });
  const demo = usersRepo.create({
    name: 'demo@example.com',
    password: await bcrypt.hash('demo1234', 10),
    role: 'user',
  });
  await usersRepo.save(admin);
  await usersRepo.save(demo);

  // Item types
  const small = itemTypesRepo.create({ name: 'Small Box', unitWeightKg: 1, unitVolumeM3: 0.02, lengthM: 0.4, widthM: 0.3, heightM: 0.2 });
  const medium = itemTypesRepo.create({ name: 'Medium Box', unitWeightKg: 2, unitVolumeM3: 0.05, lengthM: 0.6, widthM: 0.4, heightM: 0.25 });
  const large = itemTypesRepo.create({ name: 'Large Box', unitWeightKg: 5, unitVolumeM3: 0.1, lengthM: 0.8, widthM: 0.6, heightM: 0.25 });
  await itemTypesRepo.save([small, medium, large]);

  // Containers (owned by demo)
  const contA = containersRepo.create({ name: 'Container A', maxWeightKg: 200, maxVolumeM3: 2.5, ownerId: demo.id });
  const contB = containersRepo.create({ name: 'Container B', maxWeightKg: 120, maxVolumeM3: 1.2, ownerId: demo.id });
  await containersRepo.save([contA, contB]);

  // Items
  const it1 = itemsRepo.create({ container: contA, itemType: small, quantity: 10, note: 'Small items' });
  const it2 = itemsRepo.create({ container: contA, itemType: medium, quantity: 5 });
  const it3 = itemsRepo.create({ container: contB, itemType: large, quantity: 3 });
  await itemsRepo.save([it1, it2, it3]);

  await AppDataSource.destroy();
  console.log('Seed completed.');
}

seed().catch(async (err) => {
  console.error(err);
  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } finally {
    process.exit(1);
  }
});
