
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Users } from '../../users/entities/users.entity.js';
import { FamilyMember } from '../../family-members/entities/family-member.entity.js';

@Entity('profile_update_requests')
export class ProfileUpdateRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, { nullable: false })
  @JoinColumn({ name: 'tenant_user_id' })
  tenant: Relation<Users>;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'profile',
  })
  requestType: string;

  @ManyToOne(() => FamilyMember, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'family_member_id' })
  familyMember: Relation<FamilyMember> | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  requestedName: string | null;

  @Column({ type: 'varchar', length: 11, nullable: true })
  requestedPhone: string | null;

  @Column({ type: 'jsonb', nullable: true })
  requestedChanges: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => Users, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy: Relation<Users> | null;

  @Column({ type: 'text', nullable: true })
  reviewNote: string | null;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt: Date | null;
}
