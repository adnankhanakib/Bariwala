import { MaintenanceStatus } from './enums/maintenance-status.enum.js';
import { WorkOrderStatus } from './enums/work-order-status.enum.js';

const REQUEST_FLOW: Record<MaintenanceStatus, MaintenanceStatus[]> = {
    [MaintenanceStatus.SUBMITTED]: [MaintenanceStatus.ACCEPTED, MaintenanceStatus.REJECTED],
    [MaintenanceStatus.ACCEPTED]: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.REJECTED],
    [MaintenanceStatus.IN_PROGRESS]: [MaintenanceStatus.RESOLVED],
    [MaintenanceStatus.RESOLVED]: [],
    [MaintenanceStatus.REJECTED]: [],
};

const WORK_ORDER_FLOW: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    [WorkOrderStatus.SCHEDULED]: [
        WorkOrderStatus.IN_PROGRESS,
        WorkOrderStatus.COMPLETED,
        WorkOrderStatus.CANCELLED,
    ],
    [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
    [WorkOrderStatus.COMPLETED]: [],
    [WorkOrderStatus.CANCELLED]: [],
};

export function isValidTransition(from: MaintenanceStatus, to: MaintenanceStatus): boolean {
    return REQUEST_FLOW[from].includes(to);
}

export function isValidWorkOrderTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
    return WORK_ORDER_FLOW[from].includes(to);
}