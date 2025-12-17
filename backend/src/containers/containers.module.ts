import { Module } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { ContainersController } from './containers.controller';
import { ItemTypesModule } from '../item-types/item-types.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemEntity } from '../infra/postgres/entities/item.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { RolesGuard } from '../auth/roles.guard';
import { CONTAINERS_SERVICE } from '../core/tokens';

@Module({
  imports: [ItemTypesModule, TypeOrmModule.forFeature([ContainerEntity, ItemEntity, ItemTypeEntity])],
  providers: [ContainersService, { provide: CONTAINERS_SERVICE, useExisting: ContainersService }, RolesGuard],
  controllers: [ContainersController],
  exports: [ContainersService, CONTAINERS_SERVICE],
})
export class ContainersModule {}
