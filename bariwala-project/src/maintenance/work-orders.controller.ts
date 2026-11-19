import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service.js';
import { CreateWorkOrderDTO } from './dtos/create-work-order.dto.js';
import { UpdateWorkOrderDTO } from './dtos/update-work-order.dto.js';
import { UpdateWorkOrderStatusDTO } from './dtos/update-work-order-status.dto.js';
import { ListWorkOrderQueryDTO } from './dtos/list-work-order-query.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import type { AuthRequest } from './types/auth-user.js';


@Controller()
@UseGuards(JwtGuard, RolesGuard)
@Roles('owner', 'admin')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post('maintenance-requests/:requestId/work-orders')
  create(
    @Req() req: AuthRequest,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: CreateWorkOrderDTO,
  ) {
    return this.workOrdersService.create(req.user, requestId, dto);
  }

  @Get('work-orders')
  findAll(@Req() req: AuthRequest, @Query() query: ListWorkOrderQueryDTO) {
    return this.workOrdersService.findAll(req.user, query);
  }

  @Get('work-orders/:id')
  findOne(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.workOrdersService.findOne(req.user, id);
  }

  @Patch('work-orders/:id/status')
  changeStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkOrderStatusDTO,
  ) {
    return this.workOrdersService.changeStatus(req.user, id, dto);
  }

  @Patch('work-orders/:id')
  update(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkOrderDTO,
  ) {
    return this.workOrdersService.update(req.user, id, dto);
  }

  @Delete('work-orders/:id')
  remove(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
    return this.workOrdersService.remove(req.user, id);
  }
}