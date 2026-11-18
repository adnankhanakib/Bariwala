import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service.js';
import { WorkOrdersService } from './work-orders.service.js';
import { MaintenanceController } from './maintenance.controller.js';
import { TenantMaintenanceController } from './tenant-maintenance.controller.js';
import { WorkOrdersController } from './work-orders.controller.js';
import { MaintenanceRequest } from './entities/maintenance-request.entity.js';
import { WorkOrder } from './entities/work-order.entity.js';
import { Tenant } from './stubs/tenant.stub.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, WorkOrder, Tenant])],
  controllers: [MaintenanceController, TenantMaintenanceController, WorkOrdersController],
  providers: [MaintenanceService, WorkOrdersService],
})
export class MaintenanceModule {}