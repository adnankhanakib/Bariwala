import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDTO } from './pagination-query.dto.js';
import { WorkOrderStatus } from '../enums/work-order-status.enum.js';
import { MaintenancePriority } from '../enums/maintenance-priority.enum.js';

export class ListWorkOrderQueryDTO extends PaginationQueryDTO {
    @IsOptional()
    @IsEnum(WorkOrderStatus)
    status?: WorkOrderStatus;
    @IsOptional()
    @IsEnum(MaintenancePriority)
    priority?: MaintenancePriority;
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    maintenanceRequestId?: number;
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    assignedToUserId?: number;
    
    @IsOptional()
    @IsDateString()
    scheduledFrom?: string;
    @IsOptional()
    @IsDateString()
    scheduledTo?: string;
}