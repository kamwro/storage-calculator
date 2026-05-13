import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from '../infra/postgres/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USERS_SERVICE } from '../core/tokens';
import { CreateUserUseCase } from '../core/use-cases/create-user.use-case';
import { UsersController } from './users.controller';
import { ContainersModule } from '../containers/containers.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ContainersModule],
  providers: [UsersService, { provide: USERS_SERVICE, useExisting: UsersService }, CreateUserUseCase],
  exports: [UsersService, USERS_SERVICE, CreateUserUseCase],
  controllers: [UsersController],
})
export class UsersModule {}
