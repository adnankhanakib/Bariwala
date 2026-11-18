import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDTO } from './pagination-query.dto.js';
import { MaintenanceStatus } from '../enums/maintenance-status.enum.js';
import { MaintenancePriority } from '../enums/maintenance-priority.enum.js';

export class ListMaintenanceQueryDTO extends PaginationQueryDTO {
    @IsOptional()
    @IsEnum(MaintenanceStatus)
    status?: MaintenanceStatus;
    @IsOptional()
    @IsEnum(MaintenancePriority)
    priority?: MaintenancePriority;
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    flatId?: number;
    
    @IsOptional()
    @IsDateString()
    dateFrom?: string;
    @IsOptional()
    @IsDateString()
    dateTo?: string;
}