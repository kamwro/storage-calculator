import { IsNumber, IsUUID, Min } from 'class-validator';

/**
 * Shared DTO describing a projection of an item inside a container.
 */
export class ProjectItemDto {
  /**
   * Item type identifier.
   */
  @IsUUID()
  itemTypeId: string;

  /**
   * Quantity of the given item type (non-negative).
   */
  @IsNumber()
  @Min(0)
  quantity: number;
}
