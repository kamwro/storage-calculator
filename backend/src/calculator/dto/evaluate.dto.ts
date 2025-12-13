import { IsArray, IsUUID, IsIn, ValidateNested, IsNumber, Min, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluateItemDto {
  @IsUUID()
  itemTypeId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class EvaluateRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluateItemDto)
  @ArrayMaxSize(100)
  items: EvaluateItemDto[];

  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  containers: string[];

  @IsIn(['first_fit', 'best_fit', 'single_container_only'])
  strategy: 'first_fit' | 'best_fit' | 'single_container_only';
}
