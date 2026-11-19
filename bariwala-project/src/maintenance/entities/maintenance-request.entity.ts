import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Flat } from '../../flats/entities/flat.entity.js';
import { Users } from '../../users/entities/users.entity.js';
import { MaintenancePriority } from '../enums/maintenance-priority.enum.js';
import { MaintenanceStatus } from '../enums/maintenance-status.enum.js';
import { WorkOrder } from './work-order.entity.js';

@Entity('maintenance_requests')
export class MaintenanceRequest {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'int', name: 'flat_id' })
    flatId: number;
    @ManyToOne(() => Flat, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'flat_id' })
    flat: Relation<Flat>;
    @Column({ type: 'int', name: 'tenant_user_id' })
    tenantUserId: number;
    @ManyToOne(() => Users, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_user_id' })
    tenantUser: Relation<Users>;
    @Column({ type: 'varchar', length: 100 })
    title: string;
    @Column({ type: 'text' })
    description: string;
    @Column({ type: 'enum', enum: MaintenancePriority, default: MaintenancePriority.MEDIUM })
    priority: MaintenancePriority;
    @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.SUBMITTED })
    status: MaintenanceStatus;
    @OneToMany(() => WorkOrder, (workOrder) => workOrder.maintenanceRequest)
    workOrders: Relation<WorkOrder[]>;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}