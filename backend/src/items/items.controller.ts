import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('containers/:containerId/items')
  list(@Param('containerId', ParseUUIDPipe) containerId: string) {
    return this.itemsService.listByContainer(containerId);
  }

  @Post('containers/:containerId/items')
  create(
    @Param('containerId', ParseUUIDPipe) containerId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.create(containerId, dto);
  }

  @Patch('items/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @Delete('items/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.remove(id);
  }
}
