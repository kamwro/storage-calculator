import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateContainerDto {
  @ApiPropertyOptional({ description: 'New container name', example: 'Container A (updated)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'New maximum weight capacity in kilograms', example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeightKg?: number;

  @ApiPropertyOptional({ description: 'New maximum volume capacity in cubic metres', example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxVolumeM3?: number;
}
