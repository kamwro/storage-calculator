import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTypesService } from './item-types.service';
import { ItemTypesController } from './item-types.controller';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { ITEM_TYPES_SERVICE } from '../core/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([ItemTypeEntity])],
  controllers: [ItemTypesController],
  providers: [ItemTypesService, { provide: ITEM_TYPES_SERVICE, useExisting: ItemTypesService }],
  exports: [ItemTypesService, ITEM_TYPES_SERVICE],
})
export class ItemTypesModule {}
