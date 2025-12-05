import { IsNumber, Min, IsUUID } from 'class-validator';

export class CreateItemTypeDto {
  @IsUUID()
  name: string;

  @IsNumber()
  @Min(0)
  weightPerKg: number;

  @IsNumber()
  @Min(0)
  volumePerM3: number;
}
