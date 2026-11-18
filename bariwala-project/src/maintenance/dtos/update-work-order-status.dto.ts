import { IsEnum } from 'class-validator';
import { WorkOrderStatus } from '../enums/work-order-status.enum.js';

export class UpdateWorkOrderStatusDTO {
    @IsEnum(WorkOrderStatus, {
        message: 'Status must be scheduled, in_progress, completed or cancelled',
    })
    status: WorkOrderStatus;
}