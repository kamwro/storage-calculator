import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculatorService } from './calculator.service';
import { CalculatorController } from './calculator.controller';
import { ContainerEntity } from '../infra/postgres/entities/container.entity';
import { ItemTypeEntity } from '../infra/postgres/entities/item-type.entity';
import { CALCULATOR_SERVICE } from '../core/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([ContainerEntity, ItemTypeEntity])],
  providers: [CalculatorService, { provide: CALCULATOR_SERVICE, useExisting: CalculatorService }],
  controllers: [CalculatorController],
  exports: [CalculatorService, CALCULATOR_SERVICE],
})
export class CalculatorModule {}
