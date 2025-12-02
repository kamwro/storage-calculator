import { IsString, IsNumber, Min } from 'class-validator';

export class CreateItemTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  weightPerKg: number;

  @IsNumber()
  @Min(0)
  volumePerM3: number;
}
