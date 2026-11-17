import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Users } from '../../users/entities/users.entity.js';
import { Flat } from '../../flats/entities/flat.entity.js';

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Users, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: Relation<Users>;
    @OneToOne(() => Flat, { nullable: false })
    @JoinColumn({ name: 'flat_id' })
    flat: Relation<Flat>;
}