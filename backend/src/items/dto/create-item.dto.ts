import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ description: 'ID of the item type to store', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  itemTypeId: string;

  @ApiProperty({ description: 'Number of units to store', example: 10 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Optional free-form note', example: 'Fragile — handle with care' })
  @IsOptional()
  @IsString()
  note?: string;
}
