import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Users } from '../../users/entities/users.entity.js';
import { MaintenanceStatus } from '../enums/maintenance-status.enum.js';
import { MaintenanceRequest } from './maintenance-request.entity.js';

@Entity('maintenance_updates')
export class MaintenanceUpdate {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => MaintenanceRequest, (request) => request.updates, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'request_id' })
    request: Relation<MaintenanceRequest>;
    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: Relation<Users>;
    @Column({ type: 'enum', enum: MaintenanceStatus, name: 'old_status' })
    oldStatus: MaintenanceStatus;
    @Column({ type: 'enum', enum: MaintenanceStatus, name: 'new_status' })
    newStatus: MaintenanceStatus;
    @Column({ type: 'text', nullable: true })
    comment: string | null;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}