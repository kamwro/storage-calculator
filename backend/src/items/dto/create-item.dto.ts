import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';

/**
 * Payload to create an item inside a container.
 */
export class CreateItemDto {
  /**
   * ID of the item type to associate with the item.
   */
  @IsUUID()
  itemTypeId: string;

  /**
   * Number of units to store (non-negative).
   */
  @IsNumber()
  @Min(0)
  quantity: number;

  /**
   * Optional free-form note about the item.
   */
  @IsOptional()
  @IsString()
  note?: string;
}
