import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MaintenanceStatus } from '../enums/maintenance-status.enum.js';

export class UpdateStatusDTO {
    @IsEnum(MaintenanceStatus, { message: 'Status must be PENDING, IN_PROGRESS or DONE' })
    newStatus: MaintenanceStatus;
    @IsString()
    @IsOptional()
    comment?: string;
}