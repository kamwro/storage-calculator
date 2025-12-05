import { IsNumber, IsUUID, Min } from 'class-validator';

export class ProjectItemDto {
  @IsUUID()
  itemTypeId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}
