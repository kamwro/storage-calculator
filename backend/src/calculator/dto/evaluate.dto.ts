import { IsArray, IsUUID, IsIn, ValidateNested, IsNumber, Min, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Single demand line specifying an item type and quantity to allocate.
 */
export class EvaluateItemDto {
  /**
   * ID of the item type being requested.
   */
  @IsUUID()
  itemTypeId: string;

  /**
   * Requested units of the item type (non-negative, fractional values are rounded down internally).
   */
  @IsNumber()
  @Min(0)
  quantity: number;
}

/**
 * Request payload to evaluate an allocation strategy over a set of containers.
 */
export class EvaluateRequestDto {
  /**
   * List of demand lines to be allocated by the chosen strategy.
   * Limited to 100 entries to keep evaluation bounded.
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluateItemDto)
  @ArrayMaxSize(100)
  items: EvaluateItemDto[];

  /**
   * Candidate containers (by id) to consider during evaluation.
   * Limited to 100 entries to keep evaluation bounded.
   */
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  containers: string[];

  /**
   * Allocation strategy key to use: `first_fit`, `best_fit`, or `single_container_only`.
   */
  @IsIn(['first_fit', 'best_fit', 'single_container_only'])
  strategy: 'first_fit' | 'best_fit' | 'single_container_only';
}
