import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateContainerDto {
  @ApiProperty({ description: 'Human-readable container name', example: 'Container A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Maximum weight capacity in kilograms', example: 200 })
  @IsNumber()
  @Min(0)
  maxWeightKg: number;

  @ApiProperty({ description: 'Maximum volume capacity in cubic metres', example: 2.5 })
  @IsNumber()
  @Min(0)
  maxVolumeM3: number;

  @ApiProperty({ description: "Determines whether a container is a user's favorite", example: false, default: false })
  @IsBoolean()
  isFavorite: boolean = false;
}
