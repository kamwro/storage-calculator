import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, IsIn, ValidateNested, IsNumber, Min, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluateItemDto {
  @ApiProperty({ description: 'ID of the item type to allocate', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  itemTypeId: string;

  @ApiProperty({ description: 'Number of units to allocate', example: 10 })
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class EvaluateRequestDto {
  @ApiProperty({
    description: 'Demand lines to allocate (max 100)',
    type: [EvaluateItemDto],
    example: [
      { itemTypeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', quantity: 10 },
      { itemTypeId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 5 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluateItemDto)
  @ArrayMaxSize(100)
  items: EvaluateItemDto[];

  @ApiProperty({
    description: 'Candidate container IDs to consider (max 100)',
    type: [String],
    example: ['b2c3d4e5-f6a7-8901-bcde-f01234567891', 'c3d4e5f6-a7b8-9012-cdef-012345678912'],
  })
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  containers: string[];

  @ApiProperty({
    description: 'Allocation strategy to apply',
    enum: ['first_fit', 'best_fit', 'best_fit_decreasing', 'bfd', 'single_container_only'],
    example: 'best_fit_decreasing',
  })
  @IsIn(['first_fit', 'best_fit', 'best_fit_decreasing', 'bfd', 'single_container_only'])
  strategy: 'first_fit' | 'best_fit' | 'best_fit_decreasing' | 'bfd' | 'single_container_only';
}
