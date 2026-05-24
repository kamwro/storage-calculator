import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { ContainersService } from '../containers/containers.service';
import type { AuthenticatedRequest } from '../shared/auth/types';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly containersService: ContainersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  getUsers() {
    return this.usersService.findAll();
  }

  @Get(':id/containers')
  @ApiOperation({ summary: 'List containers owned by a user (admin only)' })
  @ApiParam({ name: 'id', type: String })
  getUserContainers(@Param('id', ParseUUIDPipe) id: string) {
    return this.containersService.findByOwner(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user and all their containers (admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'User and their containers deleted' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    await this.containersService.removeByOwner(id);
    await this.usersService.remove(id, req.user.id);
  }
}
