import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContainersModule } from './containers/containers.module';
import { ItemTypesModule } from './item-types/item-types.module';
import { ItemsModule } from './items/items.module';
import { CalculatorModule } from './calculator/calculator.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './infra/postgres/data-source';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ContainersModule,
    ItemTypesModule,
    ItemsModule,
    CalculatorModule,
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
