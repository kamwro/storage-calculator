import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOwnerIdToContainers1700000000000 implements MigrationInterface {
  name = 'AddOwnerIdToContainers1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Try common table names, since ContainerEntity didn't specify an explicit name earlier.
    // Prefer explicit 'containers' if it exists, else fallback to TypeORM default 'container_entity'.
    const hasContainers = await queryRunner.hasTable('containers');
    const table = hasContainers ? 'containers' : 'container_entity';

    // Add column if missing (nullable to be safe for existing rows). Ownership will be set by seeds.
    await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "ownerId" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasContainers = await queryRunner.hasTable('containers');
    const table = hasContainers ? 'containers' : 'container_entity';
    await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "ownerId"`);
  }
}
