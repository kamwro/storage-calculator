import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';

@Controller('containers')
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get()
  findAll() {
    return this.containersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.containersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContainerDto) {
    return await this.containersService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContainerDto) {
    return await this.containersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.containersService.remove(id);
  }

  @Post(':id/calculate')
  async calculate(@Param('id', ParseUUIDPipe) id: string) {
    return this.containersService.calculate(id);
  }

  @Get(':id/summary')
  async summary(@Param('id', ParseUUIDPipe) id: string) {
    return this.containersService.calculate(id);
  }
}
