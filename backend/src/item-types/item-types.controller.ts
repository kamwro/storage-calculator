import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ItemTypesService } from './item-types.service';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

/**
 * ItemTypesController
 *
 * Public listing and admin-only creation of item types used by items.
 */
@Controller('item-types')
@ApiTags('Item Types')
export class ItemTypesController {
  constructor(private readonly itemTypesService: ItemTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List item types (public, paginated)' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'dir', required: false, enum: ['asc', 'desc'] })
  findAll(@Query() q: PaginationQueryDto) {
    return this.itemTypesService.findAll(q);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new item type (admin only)' })
  @ApiBody({ type: CreateItemTypeDto })
  create(@Body() dto: CreateItemTypeDto) {
    return this.itemTypesService.create(dto);
  }
}
