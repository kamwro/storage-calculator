import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from '../infra/postgres/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USERS_SERVICE } from '../core/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService, { provide: USERS_SERVICE, useExisting: UsersService }],
  exports: [UsersService, USERS_SERVICE],
})
export class UsersModule {}
