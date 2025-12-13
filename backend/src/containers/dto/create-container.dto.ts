import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateContainerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  maxWeightKg: number;

  @IsNumber()
  @Min(0)
  maxVolumeM3: number;
}
