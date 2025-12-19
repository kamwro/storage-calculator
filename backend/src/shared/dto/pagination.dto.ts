import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Standard pagination and sorting query parameters.
 */
export class PaginationQueryDto {
  /**
   * Number of records to skip from the beginning. Defaults to 0.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  /**
   * Page size (max 100). Defaults to 20.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /**
   * Optional field name to sort by.
   */
  @IsOptional()
  @IsString()
  sort?: string;

  /**
   * Sort direction: ascending or descending. Defaults to 'asc'.
   */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  dir?: 'asc' | 'desc' = 'asc';
}

/**
 * Standard paginated response envelope.
 */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  offset: number;
  limit: number;
};
