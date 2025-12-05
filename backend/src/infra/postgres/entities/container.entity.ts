import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ContainerItem {
  itemTypeId: string;
  quantity: number;
}

@Entity()
export class ContainerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('float')
  maxWeight: number;

  @Column('float')
  maxVolume: number;

  @Column({ type: 'jsonb', default: [] })
  items: ContainerItem[];
}
