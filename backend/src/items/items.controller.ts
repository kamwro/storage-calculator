import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, Req } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../shared/auth/types';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('containers/:containerId/items')
  list(@Param('containerId', ParseUUIDPipe) containerId: string, @Req() req: AuthenticatedRequest) {
    return this.itemsService.listByContainer(containerId, req.user);
  }

  @Post('containers/:containerId/items')
  create(
    @Param('containerId', ParseUUIDPipe) containerId: string,
    @Body() dto: CreateItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.itemsService.create(containerId, dto, req.user);
  }

  @Patch('items/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto, @Req() req: AuthenticatedRequest) {
    return this.itemsService.update(id, dto, req.user);
  }

  @Delete('items/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.itemsService.remove(id, req.user);
  }
}
