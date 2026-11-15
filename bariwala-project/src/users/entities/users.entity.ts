import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class Users{
    @PrimaryGeneratedColumn()
    id:number
    @Column({
        type:'varchar',
        length:50
    })
    name:string;
    @Column({
        type:'varchar',
        unique:true
    })
    email:string;
    @Column({
        type:'varchar',
        length:11
    })
    phone:string;
    @Column({
        type:'varchar'
    })
    password:string;
    @CreateDateColumn({
        name:"created_at"
    })
    createdAt:Date;
    @UpdateDateColumn({
        name:"updated_at"
    })
    updatedAt:Date;
}