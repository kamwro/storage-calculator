import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity, ContainerEntity, ItemTypeEntity])],
  providers: [ItemsService, RolesGuard],
  controllers: [ItemsController],
  exports: [ItemsService],
})
export class ItemsModule {}
