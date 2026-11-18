import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service.js';
import { CreateMaintenanceDTO } from './dtos/create-maintenance.dto.js';
import { UpdateMaintenanceDTO } from './dtos/update-maintenance.dto.js';
import { UpdateStatusDTO } from './dtos/update-status.dto.js';
import { ListMaintenanceQueryDTO } from './dtos/list-maintenance-query.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import type { AuthRequest } from './types/auth-user.js';

@Controller('maintenance-requests')
@UseGuards(JwtGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles('tenant')
  create(@Req() req: AuthRequest, @Body() dto: CreateMaintenanceDTO) {
    return this.maintenanceService.create(req.user, dto);
  }

  @Get()
  @Roles('owner', 'admin')
  findAll(@Req() req: AuthRequest, @Query() query: ListMaintenanceQueryDTO) {
    return this.maintenanceService.findAll(req.user, query);
  }

  @Get(':id')
  @Roles('tenant', 'owner', 'admin')
  findOne(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.findOne(req.user, id);
  }

  @Patch(':id/status')
  @Roles('owner', 'admin')
  changeStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDTO,
  ) {
    return this.maintenanceService.changeStatus(req.user, id, dto);
  }

  @Patch(':id')
  @Roles('tenant', 'owner', 'admin')
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceDTO,
  ) {
    return this.maintenanceService.update(req.user, id, dto);
  }

  @Delete(':id')
  @Roles('tenant', 'owner', 'admin')
  remove(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.remove(req.user, id);
  }
}