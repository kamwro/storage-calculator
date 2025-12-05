import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTypesService } from './item-types.service';
import { ItemTypesController } from './item-types.controller';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemTypeEntity])],
  controllers: [ItemTypesController],
  providers: [ItemTypesService],
  exports: [ItemTypesService],
})
export class ItemTypesModule {}
