import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ContainerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('float')
  maxWeightKg: number;

  @Column('float')
  maxVolumeM3: number;
}
