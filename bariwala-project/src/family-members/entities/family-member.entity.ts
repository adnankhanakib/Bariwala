
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Users } from '../../users/entities/users.entity.js';

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, { nullable: false })
  @JoinColumn({ name: 'tenant_user_id' })
  tenant: Relation<Users>;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 30 })
  relationship: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  phone: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ name: 'is_emergency_contact', default: false })
  isEmergencyContact: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
