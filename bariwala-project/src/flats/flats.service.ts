import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Flat } from './entities/flat.entity.js';
import { CreateFlatDTO } from './dtos/create-flat.dto.js';
import { UpdateFlatDTO } from './dtos/update-flat.dto.js';
import { AssignFlatOwnerDTO } from './dtos/assign-flat.dto.js';
import { UsersService } from '../users/users.service.js';
import { Users } from '../users/entities/users.entity.js';
import { Tenant } from '../maintenance/stubs/tenant.stub.entity.js';

@Injectable()
export class FlatsService {
    constructor(
        @InjectRepository(Flat)
        private readonly flatRepo: Repository<Flat>,
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource,
    ) {}

    private async loadFlat(flatID: number, userID: number, role: string) {
        const flat = await this.flatRepo.findOne({
            where: { id: flatID },
            relations: { owner: true, tenant: true },
        });
        if (!flat || (role !== 'admin' && flat.owner.id !== userID)) {
            throw new NotFoundException(`Flat not found with ID ${flatID}`);
        }
        return flat;
    }

    private async loadOwner(ownerID: number): Promise<Users> {
        const owner = await this.usersService.getUserByID(ownerID);
        if (owner.role !== 'owner') {
            throw new BadRequestException(`User ${ownerID} is not an owner`);
        }
        return owner;
    }

    private async ensureUnique(flatNo: string, address: string, exceptID?: number) {
        const same = await this.flatRepo.findOne({ where: { flatNo, address } });
        if (same && same.id !== exceptID) {
            throw new ConflictException("Same address can't have multiple flats with same flat number");
        }
    }

    private view(flat: Flat) {
        return {
            flatID: flat.id,
            flatNumber: flat.flatNo,
            address: flat.address,
            floor: flat.floor,
            bedrooms: flat.bedrooms,
            rent: flat.rent,
            owner: flat.owner ? { id: flat.owner.id, name: flat.owner.name, contact: flat.owner.phone } : undefined,
            tenant: flat.tenant ? { id: flat.tenant.id, name: flat.tenant.name, contact: flat.tenant.phone } : null,
            tenantJoinDate: flat.tenantJoinDate,
        };
    }

    async showAllFlats(userID: number, role: string) {
        const flats = await this.flatRepo.find({
            where: role === 'admin' ? {} : { owner: { id: userID } },
            relations: { owner: true },
            order: { id: 'ASC' },
        });
        if (flats.length == 0) {
            return { totalFlats: 0, message: 'No flats found' };
        }
        const flatData = flats.map((flat) => ({
            flatID: flat.id,
            flatNumber: flat.flatNo,
            address: flat.address,
            floor: flat.floor,
            flatInformation: {
                bedrooms: flat.bedrooms,
                rent: flat.rent,
                owner: flat.owner.name + ` (${flat.owner.phone})`,
            },
        }));
        return { message: 'Flats fetched successfully', totalFlats: flats.length, data: flatData };
    }

    async showFlatByOwnerID(ownerID: number) {
        const flats = await this.flatRepo.find({
            where: { owner: { id: ownerID } },
            relations: { owner: true, tenant: true },
            order: { id: 'ASC' },
        });
        if (flats.length == 0) {
            return { message: `No flats found with owner ID ${ownerID}` };
        }
        return {
            message: `Flats fetched successfully for ID ${ownerID}`,
            totalFlats: flats.length,
            flats: flats.map((f) => this.view(f)),
        };
    }

    async getFlatbyID(id: number) {
        return this.flatRepo.findOne({ where: { id } });
    }

    async createFlat(dto: CreateFlatDTO, userID: number, role: string) {
        if (role !== 'admin' && dto.owner !== userID) {
            throw new ForbiddenException('Owners can only create flats for themselves');
        }
        const owner = await this.loadOwner(dto.owner);
        await this.ensureUnique(dto.flatNo, dto.address);

        const { owner: _ownerID, ...flatFields } = dto;
        const saved = await this.flatRepo.save(this.flatRepo.create({ ...flatFields, owner }));
        return {
            message: 'Flat created successfully',
            flatInformation: {
                flatID: saved.id,
                flatNumber: saved.flatNo,
                address: saved.address,
                floor: saved.floor,
            },
            ownerInformation: { name: owner.name, contact: owner.phone },
        };
    }

    async flatInformation(flatID: number, userID: number, role: string) {
        const flat = await this.loadFlat(flatID, userID, role);
        const { owner, tenant, ...otherFields } = flat;
        return {
            flatInformation: otherFields,
            ownerInformation: { name: owner.name, contact: owner.phone },
            tenantInformation: tenant ? { id: tenant.id, name: tenant.name, contact: tenant.phone } : null,
        };
    }

    async updateFlat(flatID: number, dto: UpdateFlatDTO, userID: number, role: string) {
        const flat = await this.loadFlat(flatID, userID, role);
        const { owner: newOwnerID, ...flatFields } = dto;

        if (flatFields.flatNo !== undefined || flatFields.address !== undefined) {
            await this.ensureUnique(flatFields.flatNo ?? flat.flatNo, flatFields.address ?? flat.address, flat.id);
        }
        const changes: Partial<Flat> = { ...flatFields };
        let ownerInformation: object | undefined;
        if (newOwnerID !== undefined && newOwnerID !== flat.owner.id) {
            if (role !== 'admin') {
                throw new ForbiddenException('Only an admin can transfer a flat to another owner');
            }
            const newOwner = await this.loadOwner(newOwnerID);
            changes.owner = newOwner;
            ownerInformation = { name: newOwner.name, phone: newOwner.phone };
        }
        if (Object.keys(changes).length > 0) {
            await this.flatRepo.update(flatID, changes);
        }
        return {
            message: `Flat ID ${flatID} has been updated successfully`,
            updatedInformation: { ...flatFields, ...(ownerInformation ? { ownerInformation } : {}) },
        };
    }

    async deleteFlat(flatID: number, userID: number, role: string) {
        const flat = await this.loadFlat(flatID, userID, role);
        if (flat.tenant) {
            throw new ConflictException(`Flat ${flat.flatNo} has a tenant; evict the tenant first`);
        }
        try {
            await this.flatRepo.delete(flatID);
        } catch (err: any) {
            if (err?.code === '23503') {
                throw new ConflictException(`Flat ${flatID} has bills or expenses and cannot be deleted`);
            }
            throw err;
        }
        return { message: `Flat ID ${flatID} successfully deleted` };
    }

    async assignTenant(flatID: number, dto: AssignFlatOwnerDTO, userID: number, role: string) {
        const flat = await this.loadFlat(flatID, userID, role);
        if (flat.tenant) {
            throw new ConflictException(`Tenant already exists on flat number ${flat.flatNo}`);
        }
        const user = await this.usersService.getUserByID(dto.userID);
        if (user.role !== 'tenant') {
            throw new BadRequestException(`User ${dto.userID} is not a tenant`);
        }
        const current = await this.flatRepo.findOne({ where: { tenant: { id: user.id } } });
        if (current) {
            throw new ConflictException(`${user.name} already rents flat ${current.flatNo}`);
        }

        const todayDate = new Date();
        await this.dataSource.transaction(async (manager) => {
            await manager.update(Flat, flatID, { tenant: user, tenantJoinDate: todayDate });
            await manager.delete(Tenant, { flat: { id: flatID } });
            await manager.insert(Tenant, { user: { id: user.id }, flat: { id: flatID } });
        });
        return {
            message: 'Tenant updated successfully',
            flatInformation: {
                flatNumber: flat.flatNo,
                floor: flat.floor,
                address: flat.address,
                tenantInformation: { name: user.name, contact: user.phone },
                tenantJoinDate: todayDate,
            },
        };
    }

    async evictTenant(flatID: number, userID: number, role: string) {
        const flat = await this.loadFlat(flatID, userID, role);
        if (!flat.tenant) {
            throw new ConflictException(`No tenant lives on flat number ${flat.flatNo}`);
        }
        await this.dataSource.transaction(async (manager) => {
            await manager.update(Flat, flatID, { tenant: null, tenantJoinDate: null });
            await manager.delete(Tenant, { flat: { id: flatID } });
        });
        return {
            message: 'Tenant evicted successfully',
            flatInformation: { flatNumber: flat.flatNo, floor: flat.floor, address: flat.address },
        };
    }

    async getAllTenants(userID: number, role: string) {
        const flats = await this.flatRepo.find({
            where: role === 'admin' ? {} : { owner: { id: userID } },
            relations: { tenant: true },
            order: { id: 'ASC' },
        });
        if (flats.length == 0) {
            return { message: 'No flats found with matching owner ID' };
        }
        return flats.map((flat) => ({
            flatID: flat.id,
            flatNumber: flat.flatNo,
            tenant: flat.tenant ? { id: flat.tenant.id, name: flat.tenant.name, contact: flat.tenant.phone } : null,
        }));
    }
}
