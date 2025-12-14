import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ItemTypesService } from './item-types.service';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';

@Controller('item-types')
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypesService) {}

  @Get()
  findAll(@Query() q: PaginationQueryDto) {
    return this.itemTypesService.findAll(q);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateItemTypeDto) {
    return this.itemTypesService.create(dto);
  }
}
