import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Flat } from '../../flats/entities/flat.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';
import { Users } from '../../users/entities/users.entity.js';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Flat, {
    nullable: false,
  })
  @JoinColumn({ name: 'flat_id' })
  flat: Relation<Flat>;

  @ManyToOne(() => Vendor, {
    nullable: false,
  })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @Column({
    name: 'work_order_id',
    type: 'int',
    nullable: true,
  })
  workOrderId: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: string;

  @Column({
    name: 'expense_date',
    type: 'date',
  })
  expenseDate: Date;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    name: 'receipt_reference',
    type: 'varchar',
    nullable: true,
  })
  receiptReference: string | null;

  @ManyToOne(() => Users, {
    nullable: false,
  })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recordedBy: Relation<Users>;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}