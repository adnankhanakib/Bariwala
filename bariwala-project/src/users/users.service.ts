import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from './entities/users.entity.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';
import { UpdateUserDTO } from './dtos/update-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepo: Repository<Users>,
    ) {}

    async create(newUser: CreateUserDTO): Promise<object> {
        const existingMail = await this.usersRepo.findOneBy({ email: newUser.email });
        if (existingMail) {
            throw new ConflictException(`Email ${newUser.email} already exists`);
        }
        const { password, ...userFields } = newUser;
        const role = userFields.role ?? 'owner';
        const passwordHash = await bcrypt.hash(password, 10);

        const saved = await this.usersRepo.save(
            this.usersRepo.create({ ...userFields, role, passwordHash }),
        );
        return {
            message: 'User created successfully',
            details: {
                id: saved.id,
                name: saved.name,
                email: saved.email,
                phone: saved.phone,
                role: saved.role,
            },
        };
    }

    async showAllUsers(): Promise<Users[]> {
        return this.usersRepo.find({
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
            order: { id: 'ASC' },
        });
    }

    async getUserByID(id: number): Promise<Users> {
        const user = await this.usersRepo.findOne({
            where: { id },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
        });
        if (!user) {
            throw new NotFoundException(`No user found with ID ${id}`);
        }
        return user;
    }

    async updateUser(id: number, dto: UpdateUserDTO): Promise<object> {
        const user = await this.usersRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`No user found with id ${id}`);
        }
        if (dto.email) {
            const mailCheck = await this.getUserByEmail(dto.email);
            if (mailCheck && mailCheck.id !== id) {
                throw new ConflictException(`An user already exist with email ${dto.email}`);
            }
        }

        const { password, ...fields } = dto;
        const changes: Partial<Users> = { ...fields };
        if (password) {
            changes.passwordHash = await bcrypt.hash(password, 10);
        }
        if (Object.keys(changes).length > 0) {
            await this.usersRepo.update(id, changes);
        }
        return {
            message: `User ${id} updated successfully`,
            updatedInformation: fields,
            passwordChanged: !!password,
        };
    }

    async deleteUser(id: number): Promise<object> {
        const user = await this.usersRepo.findOneBy({ id });
        if (!user) {
            throw new NotFoundException(`No user found with id ${id}`);
        }
        try {
            await this.usersRepo.delete(id);
        } catch (err: any) {
            if (err?.code === '23503') {
                throw new ConflictException(
                    `User ${id} is still linked to flats, bills or requests and cannot be deleted`,
                );
            }
            throw err;
        }
        return { message: `User deleted successfully with ID ${id}` };
    }

    async getUserByEmail(email: string): Promise<Users | null> {
        return this.usersRepo.findOneBy({ email });
    }

    async populateDB() {
        const admin: CreateUserDTO = {
            name: 'Adnan',
            email: 'admin@example.com',
            phone: '01997753452',
            password: 'Admin121436!',
            role: 'admin',
        };
        const owner: CreateUserDTO = {
            name: 'Khan',
            email: 'owner@example.com',
            phone: '01997753452',
            password: 'Demo121436!',
            role: 'owner',
        };
        const created: string[] = [];
        for (const user of [admin, owner]) {
            if (!(await this.usersRepo.findOneBy({ email: user.email }))) {
                await this.create(user);
                created.push(user.email);
            }
        }
        return {
            message: created.length
                ? 'Database populated with demo accounts'
                : 'Database already populated with these values',
            accounts: [
                { email: admin.email, role: 'admin' },
                { email: owner.email, role: 'owner' },
            ],
            created,
        };
    }
}
