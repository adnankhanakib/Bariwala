import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service.js';
import { MaintenanceController } from './maintenance.controller.js';
import { MaintenanceRequest } from './entities/maintenance-request.entity.js';
import { MaintenanceUpdate } from './entities/maintenance-update.entity.js';
import { Tenant } from './stubs/tenant.stub.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceRequest, MaintenanceUpdate, Tenant])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}