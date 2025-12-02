import { IsString, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProjectItemDto {
  @IsNumber()
  itemTypeId: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  maxWeight: number;

  @IsNumber()
  @Min(0)
  maxVolume: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectItemDto)
  items: ProjectItemDto[];
}
