import { Controller, Get, Post, Body } from '@nestjs/common';
import { ItemTypesService } from './item-types.service';
import { CreateItemTypeDto } from './dto/create-item-type.dto';

@Controller('item-types')
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypesService) {}

  @Get()
  findAll() {
    return this.itemTypesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateItemTypeDto) {
    return this.itemTypesService.create(dto);
  }
}
