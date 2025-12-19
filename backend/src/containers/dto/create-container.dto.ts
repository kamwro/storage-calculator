import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

/**
 * Payload to create a new container owned by the current user.
 */
export class CreateContainerDto {
  /**
   * Human-readable container name.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Maximum weight capacity in kilograms.
   * - must be a non-negative number
   */
  @IsNumber()
  @Min(0)
  maxWeightKg: number;

  /**
   * Maximum volume capacity in cubic meters.
   * - must be a non-negative number
   */
  @IsNumber()
  @Min(0)
  maxVolumeM3: number;
}
