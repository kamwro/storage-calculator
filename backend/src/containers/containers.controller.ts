import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
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
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return await this.containersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContainerDto) {
    return await this.containersService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() dto: UpdateContainerDto) {
    return await this.containersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    return await this.containersService.remove(id);
  }

  @Post(':id/calculate')
  async calculate(@Param('id', ParseIntPipe) id: string) {
    return this.containersService.calculate(id);
  }
}
