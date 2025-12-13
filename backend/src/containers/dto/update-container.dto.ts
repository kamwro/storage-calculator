import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateContainerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxVolumeM3?: number;
}
