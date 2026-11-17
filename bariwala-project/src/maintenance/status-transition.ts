import { MaintenanceStatus } from './enums/maintenance-status.enum.js';

const ORDER = [
    MaintenanceStatus.PENDING,
    MaintenanceStatus.IN_PROGRESS,
    MaintenanceStatus.DONE,
];


export function isValidTransition(from: MaintenanceStatus, to: MaintenanceStatus): boolean {
    return ORDER.indexOf(to) === ORDER.indexOf(from) + 1;
}