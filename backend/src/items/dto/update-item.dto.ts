import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class UpdateItemDto {
  @ApiPropertyOptional({ description: 'New item type ID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID()
  itemTypeId?: string;

  @ApiPropertyOptional({ description: 'New quantity', example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Updated note', example: 'Checked — quantity confirmed' })
  @IsOptional()
  @IsString()
  note?: string;
}
