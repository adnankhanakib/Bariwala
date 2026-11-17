import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MaintenanceService } from './maintenance.service.js';
import { CreateMaintenanceDTO } from './dtos/create-maintenance.dto.js';
import { UpdateStatusDTO } from './dtos/update-status.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import type { AuthUser } from './types/auth-user.js';

type AuthRequest = Request & { user: AuthUser };

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
  @Roles('owner', 'tenant')
  findAll(@Req() req: AuthRequest) {
    return this.maintenanceService.findAll(req.user);
  }

  @Get(':id')
  @Roles('owner', 'tenant')
  findOne(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.findOne(req.user, id);
  }

  @Patch(':id/status')
  @Roles('owner')
  changeStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDTO,
  ) {
    return this.maintenanceService.changeStatus(req.user, id, dto);
  }

  @Get(':id/history')
  @Roles('owner')
  getHistory(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.maintenanceService.getHistory(req.user, id);
  }
}