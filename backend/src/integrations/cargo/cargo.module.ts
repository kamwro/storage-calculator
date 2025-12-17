import { Module } from '@nestjs/common';
import { CargoClient } from './cargo.client';
import { CARGO_CLIENT } from '../../core/tokens';

@Module({
  providers: [CargoClient, { provide: CARGO_CLIENT, useExisting: CargoClient }],
  exports: [CargoClient, CARGO_CLIENT],
})
export class CargoModule {}
