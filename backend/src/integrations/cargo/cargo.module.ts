import { Module } from '@nestjs/common';
import { CargoClient } from './cargo.client';

@Module({
  providers: [CargoClient],
  exports: [CargoClient],
})
export class CargoModule {}
