import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1778593997201 implements MigrationInterface {
  name = 'Init1778593997201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "container_entity" ADD "isFavorite" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "container_entity" DROP COLUMN "isFavorite"`);
  }
}
