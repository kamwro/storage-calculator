import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('item_types')
export class ItemTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('float')
  unitWeightKg: number;

  @Column('float')
  unitVolumeM3: number;

  @Column('float', { nullable: true })
  lengthM?: number | null;

  @Column('float', { nullable: true })
  widthM?: number | null;

  @Column('float', { nullable: true })
  heightM?: number | null;
}
