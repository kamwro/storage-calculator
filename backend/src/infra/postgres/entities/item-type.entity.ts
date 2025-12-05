import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('item_types')
export class ItemTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('float')
  weightPerKg: number;

  @Column('float')
  volumePerM3: number;
}
