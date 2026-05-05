import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateItemTypeDto {
  @ApiProperty({ description: 'Unique human-readable name', example: 'Small Box' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Weight of one unit in kilograms', example: 1 })
  @IsNumber()
  @Min(0)
  unitWeightKg: number;

  @ApiProperty({ description: 'Volume of one unit in cubic metres', example: 0.02 })
  @IsNumber()
  @Min(0)
  unitVolumeM3: number;

  @ApiPropertyOptional({ description: 'Length of one unit in metres', example: 0.4 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthM?: number;

  @ApiPropertyOptional({ description: 'Width of one unit in metres', example: 0.3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  widthM?: number;

  @ApiPropertyOptional({ description: 'Height of one unit in metres', example: 0.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number;
}
