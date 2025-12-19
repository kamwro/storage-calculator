import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, UseGuards, Req, Query } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/update-container.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../shared/auth/types';
import { PaginationQueryDto } from '../shared/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * ContainersController
 *
 * CRUD and utility operations on containers owned by the authenticated user.
 */
@Controller('containers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Containers')
@ApiBearerAuth()
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Get()
  @ApiOperation({ summary: 'List containers for current user (paginated)' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'dir', required: false, enum: ['asc', 'desc'] })
  findAll(@Req() req: AuthenticatedRequest, @Query() q: PaginationQueryDto) {
    return this.containersService.findAll(req.user, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single container by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return await this.containersService.findOne(id, req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new container' })
  async create(@Body() dto: CreateContainerDto, @Req() req: AuthenticatedRequest) {
    return await this.containersService.create(dto, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing container' })
  @ApiParam({ name: 'id', type: String })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContainerDto, @Req() req: AuthenticatedRequest) {
    return await this.containersService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a container' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Container deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return await this.containersService.remove(id, req.user);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate container utilization from its items' })
  @ApiParam({ name: 'id', type: String })
  async calculate(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.containersService.calculate(id, req.user);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get summarized utilization for a container' })
  @ApiParam({ name: 'id', type: String })
  async summary(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.containersService.calculate(id, req.user);
  }
}
