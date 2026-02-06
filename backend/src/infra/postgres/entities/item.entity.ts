import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContainerEntity } from './container.entity';
import { ItemTypeEntity } from './item-type.entity';

@Entity('items')
export class ItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ContainerEntity, { onDelete: 'CASCADE' })
  container: ContainerEntity;

  @ManyToOne(() => ItemTypeEntity, { eager: true, onDelete: 'RESTRICT' })
  itemType: ItemTypeEntity;

  @Column('float')
  quantity: number;

  @Column('text', { nullable: true })
  note?: string | null;
}
