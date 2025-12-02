import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemType } from './item-type.entity';
import { CreateItemTypeDto } from './dto/create-item-type.dto';

@Injectable()
export class ItemTypesService {
  private itemTypes: ItemType[] = [];
  private nextId = 1;

  findAll(): ItemType[] {
    return this.itemTypes;
  }

  create(dto: CreateItemTypeDto): ItemType {
    const item: ItemType = {
      id: this.nextId++,
      ...dto,
    };
    this.itemTypes.push(item);
    return item;
  }

  findById(id: number): ItemType {
    const item = this.itemTypes.find((i) => i.id === id);
    if (!item) throw new NotFoundException('Item type not found');
    return item;
  }
}
