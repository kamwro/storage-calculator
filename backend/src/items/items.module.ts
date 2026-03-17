import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { RolesGuard } from '../auth/roles.guard';
import { ITEMS_SERVICE } from '../core/tokens';
import { AddItemToContainerUseCase } from '../core/use-cases/add-item-to-container.use-case';
import { UpdateItemInContainerUseCase } from '../core/use-cases/update-item-in-container.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity, ContainerEntity, ItemTypeEntity])],
  providers: [
    ItemsService,
    { provide: ITEMS_SERVICE, useExisting: ItemsService },
    RolesGuard,
    AddItemToContainerUseCase,
    UpdateItemInContainerUseCase,
  ],
  controllers: [ItemsController],
  exports: [ItemsService, ITEMS_SERVICE, AddItemToContainerUseCase, UpdateItemInContainerUseCase],
})
export class ItemsModule {}
