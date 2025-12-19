import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

/**
 * Payload to update container properties.
 * All fields are optional; only provided values will be changed.
 */
export class UpdateContainerDto {
  /**
   * New human-readable container name.
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * New maximum weight capacity in kilograms (non-negative).
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeightKg?: number;

  /**
   * New maximum volume capacity in cubic meters (non-negative).
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxVolumeM3?: number;
}
