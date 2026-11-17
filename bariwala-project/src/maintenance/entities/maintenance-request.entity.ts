import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Flat } from '../../flats/entities/flat.entity.js';
import { Tenant } from '../stubs/tenant.stub.entity.js';
import { MaintenanceCategory } from '../enums/maintenance-category.enum.js';
import { MaintenanceStatus } from '../enums/maintenance-status.enum.js';
import { MaintenanceUpdate } from './maintenance-update.entity.js';

@Entity('maintenance_requests')
export class MaintenanceRequest {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Flat, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'flat_id' })
    flat: Relation<Flat>;
    @ManyToOne(() => Tenant, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Relation<Tenant>;
    @Column({ type: 'varchar', length: 100 })
    title: string;
    @Column({ type: 'text' })
    description: string;
    @Column({ type: 'enum', enum: MaintenanceCategory })
    category: MaintenanceCategory;
    @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.PENDING })
    status: MaintenanceStatus;
    @OneToMany(() => MaintenanceUpdate, (update) => update.request)
    updates: Relation<MaintenanceUpdate[]>;
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}