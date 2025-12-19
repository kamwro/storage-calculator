import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';

/**
 * Payload to update an existing item.
 * All fields are optional; only provided values are applied.
 */
export class UpdateItemDto {
  /**
   * New item type id to associate with the item.
   */
  @IsOptional()
  @IsUUID()
  itemTypeId?: string;

  /**
   * New quantity (non-negative) for the item.
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  /**
   * Optional note update.
   */
  @IsOptional()
  @IsString()
  note?: string;
}
