import { Module } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { ContainersController } from './containers.controller';
import { ItemTypesModule } from '../item-types/item-types.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';

@Module({
  imports: [ItemTypesModule, TypeOrmModule.forFeature([ContainerEntity])],
  providers: [ContainersService],
  controllers: [ContainersController],
})
export class ContainersModule {}
