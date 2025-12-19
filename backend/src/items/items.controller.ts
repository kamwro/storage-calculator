import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, Req, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../shared/auth/types';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

/**
 * ItemsController
 *
 * Manages items within containers for the authenticated user.
 */
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Items')
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('containers/:containerId/items')
  @ApiOperation({ summary: 'List items in a specific container (paginated)' })
  @ApiParam({ name: 'containerId', type: String })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'dir', required: false, enum: ['asc', 'desc'] })
  list(
    @Param('containerId', ParseUUIDPipe) containerId: string,
    @Req() req: AuthenticatedRequest,
    @Query() q: PaginationQueryDto,
  ) {
    return this.itemsService.listByContainer(containerId, q, req.user);
  }

  @Post('containers/:containerId/items')
  @ApiOperation({ summary: 'Create an item inside a container' })
  @ApiParam({ name: 'containerId', type: String })
  create(
    @Param('containerId', ParseUUIDPipe) containerId: string,
    @Body() dto: CreateItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.itemsService.create(containerId, dto, req.user);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update an existing item' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto, @Req() req: AuthenticatedRequest) {
    return this.itemsService.update(id, dto, req.user);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete an item' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.itemsService.remove(id, req.user);
  }
}
