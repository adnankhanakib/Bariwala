import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Users } from '../../users/entities/users.entity.js';
import { MaintenancePriority } from '../enums/maintenance-priority.enum.js';
import { WorkOrderStatus } from '../enums/work-order-status.enum.js';
import { MaintenanceRequest } from './maintenance-request.entity.js';

@Entity('work_orders')
export class WorkOrder {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'int', name: 'maintenance_request_id' })
    maintenanceRequestId: number;
    @ManyToOne(() => MaintenanceRequest, (request) => request.workOrders, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'maintenance_request_id' })
    maintenanceRequest: Relation<MaintenanceRequest>;
    @Column({ type: 'int', name: 'assigned_to_user_id', nullable: true })
    assignedToUserId: number | null;
    @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assigned_to_user_id' })
    assignedToUser: Relation<Users> | null;
    @Column({ type: 'varchar', length: 100 })
    title: string;
    @Column({ type: 'text', name: 'work_description', nullable: true })
    workDescription: string | null;
    @Column({ type: 'enum', enum: MaintenancePriority, default: MaintenancePriority.MEDIUM })
    priority: MaintenancePriority;
    @Column({ type: 'date', name: 'scheduled_date', nullable: true })
    scheduledDate: string | null;
    @Column({ type: 'enum', enum: WorkOrderStatus, default: WorkOrderStatus.SCHEDULED })
    status: WorkOrderStatus;
    @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
    completedAt: Date | null;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}