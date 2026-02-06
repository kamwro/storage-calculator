import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1770410811548 implements MigrationInterface {
  name = 'Init1770410811548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" UNIQUE ("name"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "container_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "maxWeightKg" double precision NOT NULL, "maxVolumeM3" double precision NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "PK_0ea3a2f74453d6ce8d86ec78e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "item_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "unitWeightKg" double precision NOT NULL, "unitVolumeM3" double precision NOT NULL, "lengthM" double precision, "widthM" double precision, "heightM" double precision, CONSTRAINT "PK_3600946a4e5a3a75d973b016132" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" double precision NOT NULL, "note" text, "containerId" uuid, "itemTypeId" uuid, CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ADD CONSTRAINT "FK_3869285a389fe4190bd4f0918fd" FOREIGN KEY ("containerId") REFERENCES "container_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "items" ADD CONSTRAINT "FK_ba92d7032b89f4fd952899dbbd2" FOREIGN KEY ("itemTypeId") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_ba92d7032b89f4fd952899dbbd2"`);
    await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_3869285a389fe4190bd4f0918fd"`);
    await queryRunner.query(`DROP TABLE "items"`);
    await queryRunner.query(`DROP TABLE "item_types"`);
    await queryRunner.query(`DROP TABLE "container_entity"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
