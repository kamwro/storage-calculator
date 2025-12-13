import { IsNumber, Min, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateItemTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  unitWeightKg: number;

  @IsNumber()
  @Min(0)
  unitVolumeM3: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthM?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  widthM?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number;
}
