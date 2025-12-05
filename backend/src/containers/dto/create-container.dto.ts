import { IsString, IsNumber, Min, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectItemDto } from './container.shared.dto';

export class CreateContainerDto {
  @IsString()
  @IsNotEmpty()
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
