import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type {Relation} from 'typeorm'
import { Users } from "../../users/entities/users.entity.js";
@Entity('flats')
export class Flat{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({
        name:"flat_no",
        type:"varchar",
    })
    flatNo:string;
    @Column({
        type:"varchar",
        length:50
    })
    address:string;
    @Column({
        type:"int"
    })
    floor:number;
    @Column({
        type:"int"
    })
    bedrooms:number;
    @Column({
        type:"int"
    })
    rent:number;
    @ManyToOne(
        ()=>Users,
        {
            nullable:false
        }
    )
    @JoinColumn()
    owner:Relation<Users>
    @CreateDateColumn({
        name:"created_at"
    })
    createdAt:Date
    @UpdateDateColumn({
        name:"updated_at"
    })
    updatedAt:Date
}