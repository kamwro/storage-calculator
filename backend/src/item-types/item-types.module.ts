import { Module } from '@nestjs/common';
import { ItemTypesService } from './item-types.service';
import { ItemTypesController } from './item-types.controller';

@Module({
  providers: [ItemTypesService],
  controllers: [ItemTypesController],
  exports: [ItemTypesService],
})
export class ItemTypesModule {}
