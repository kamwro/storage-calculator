import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, UseGuards, Req, Query } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../shared/auth/types';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';

@Controller('containers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest, @Query() q: PaginationQueryDto) {
    return this.containersService.findAll(req.user, q);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return await this.containersService.findOne(id, req.user);
  }

  @Post()
  async create(@Body() dto: CreateContainerDto, @Req() req: AuthenticatedRequest) {
    return await this.containersService.create(dto, req.user);
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContainerDto, @Req() req: AuthenticatedRequest) {
    return await this.containersService.update(id, dto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return await this.containersService.remove(id, req.user);
  }

  @Post(':id/calculate')
  async calculate(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.containersService.calculate(id, req.user);
  }

  @Get(':id/summary')
  async summary(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.containersService.calculate(id, req.user);
  }
}
