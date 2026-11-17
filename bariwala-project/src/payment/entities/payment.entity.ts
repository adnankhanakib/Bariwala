import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Bill } from "../../billing/entities/bill.entity.js";
import { Users } from "../../users/entities/users.entity.js";
import type {Relation} from 'typeorm'
@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    payment_id:number;
    @OneToOne(()=>Bill)
    @JoinColumn()
    bill_id:Relation<Bill>;
    @ManyToOne(()=>Users)
    @JoinColumn()
    received_by:Relation<Users>
    @Column({
        type:"int"
    })
    receipt_no:number
    @Column({
        type:"bool",
        default:false
    })
    is_paid:boolean
    @CreateDateColumn()
    created_at:Date
    @UpdateDateColumn()
    updated_at:Date
}

