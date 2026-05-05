import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContainersModule } from './containers/containers.module';
import { ItemTypesModule } from './item-types/item-types.module';
import { ItemsModule } from './items/items.module';
import { CalculatorModule } from './calculator/calculator.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './infra/postgres/data-source';
import { CargoModule } from './integrations/cargo/cargo.module';

@Module({
  imports: [
    // Auth-endpoint rate limit. Override via THROTTLE_LIMIT env var (e.g. set high in E2E/CI).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: Number(process.env.THROTTLE_LIMIT ?? 10) }]),
    AuthModule,
    UsersModule,
    ContainersModule,
    ItemTypesModule,
    ItemsModule,
    CalculatorModule,
    CargoModule,
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
