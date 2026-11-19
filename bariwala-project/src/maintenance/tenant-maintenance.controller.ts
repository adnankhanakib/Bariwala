import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service.js';
import { ListMaintenanceQueryDTO } from './dtos/list-maintenance-query.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import type { AuthRequest } from './types/auth-user.js';

// GET /tenants/me/maintenance-requests
@Controller('tenants/me/maintenance-requests')
@UseGuards(JwtGuard, RolesGuard)
export class TenantMaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @Roles('tenant')
  findMine(@Req() req: AuthRequest, @Query() query: ListMaintenanceQueryDTO) {
    return this.maintenanceService.findMine(req.user, query);
  }
}