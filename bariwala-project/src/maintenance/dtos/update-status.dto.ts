import { IsEnum } from 'class-validator';
import { MaintenanceStatus } from '../enums/maintenance-status.enum.js';

export class UpdateStatusDTO {
    @IsEnum(MaintenanceStatus, {
        message: 'Status must be submitted, accepted, in_progress, resolved or rejected',
    })
    status: MaintenanceStatus;
}