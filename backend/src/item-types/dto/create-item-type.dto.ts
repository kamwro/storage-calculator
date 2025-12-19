import { IsNumber, Min, IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * Payload to create a new item type used by items and calculations.
 */
export class CreateItemTypeDto {
  /**
   * Human-readable unique name for the item type.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Weight of a single unit in kilograms (non-negative).
   */
  @IsNumber()
  @Min(0)
  unitWeightKg: number;

  /**
   * Volume of a single unit in cubic meters (non-negative).
   */
  @IsNumber()
  @Min(0)
  unitVolumeM3: number;

  /**
   * Optional length of a single unit in meters (non-negative).
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthM?: number;

  /**
   * Optional width of a single unit in meters (non-negative).
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  widthM?: number;

  /**
   * Optional height of a single unit in meters (non-negative).
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number;
}
