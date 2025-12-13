import { IsUUID, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsUUID()
  itemTypeId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}
