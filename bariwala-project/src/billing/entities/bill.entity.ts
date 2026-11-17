import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Flat } from "../../flats/entities/flat.entity.js";
import type { Relation } from "typeorm";
@Entity('bill')
export class Bill{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    month:string;
    @Column({
        type:'int'
    })
    rent:number;
    @Column({
        type:'int'
    })
    gas:number;
    @Column({
        type:'int'
    })
    water:number;
    @Column({
        type:'int'
    })
    electricity:number;
    @Column({
        type:'int'
    })
    total:number;
    @Column({
        type:'date'
    })
    due_date:Date;
    @ManyToOne(()=>Flat)
    @JoinColumn()
    flat:Relation<Flat>
    @CreateDateColumn()
    createdAt:Date;
    @UpdateDateColumn()
    updatedAt:Date;
}