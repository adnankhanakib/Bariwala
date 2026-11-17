import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MaintenanceRequest } from './entities/maintenance-request.entity.js';
import { MaintenanceUpdate } from './entities/maintenance-update.entity.js';
import { Tenant } from './stubs/tenant.stub.entity.js';
import { Users } from '../users/entities/users.entity.js';
import { CreateMaintenanceDTO } from './dtos/create-maintenance.dto.js';
import { UpdateStatusDTO } from './dtos/update-status.dto.js';
import { MaintenanceStatus } from './enums/maintenance-status.enum.js';
import { isValidTransition } from './status-transition.js';
import type { AuthUser } from './types/auth-user.js';

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(MaintenanceRequest)
        private readonly requestRepo: Repository<MaintenanceRequest>,
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
        private readonly dataSource: DataSource,
    ) {}

    // Never return relations directly: they contain passwordHash.
    private toView(r: MaintenanceRequest) {
        return {
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category,
            status: r.status,
            flatId: r.flat?.id,
            tenantId: r.tenant?.id,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        };
    }

    private toHistoryView(u: MaintenanceUpdate) {
        return {
            id: u.id,
            oldStatus: u.oldStatus,
            newStatus: u.newStatus,
            comment: u.comment,
            changedBy: { id: u.user?.id, name: u.user?.name },
            createdAt: u.createdAt,
        };
    }

    private async loadWithAccess(user: AuthUser, id: number) {
        const request = await this.requestRepo.findOne({
            where: { id },
            relations: { flat: { owner: true }, tenant: { user: true }, updates: { user: true } },
            order: { updates: { createdAt: 'ASC' } },
        });
        if (!request) {
            throw new NotFoundException(`Maintenance request ${id} not found`);
        }
        const isOwner = user.role === 'owner' && request.flat.owner.id === user.id;
        const isTenant = user.role === 'tenant' && request.tenant.user.id === user.id;
        if (!isOwner && !isTenant) {
            throw new ForbiddenException('You cannot access this maintenance request');
        }
        return request;
    }

    async create(user: AuthUser, dto: CreateMaintenanceDTO) {
        // flat comes from the logged-in tenant, never from the body
        const tenant = await this.tenantRepo.findOne({
            where: { user: { id: user.id } },
            relations: { flat: true },
        });
        if (!tenant) {
            throw new NotFoundException('No tenant profile found for this user');
        }
        const request = this.requestRepo.create({
            ...dto,
            flat: tenant.flat,
            tenant: tenant,
        });
        const saved = await this.requestRepo.save(request);
        return {
            message: 'Maintenance request created successfully',
            data: this.toView({ ...saved, flat: tenant.flat, tenant } as MaintenanceRequest),
        };
    }

    async findAll(user: AuthUser) {
        const where =
            user.role === 'tenant'
                ? { tenant: { user: { id: user.id } } }
                : { flat: { owner: { id: user.id } } };
        const requests = await this.requestRepo.find({
            where,
            relations: { flat: true, tenant: true },
            order: { createdAt: 'DESC' },
        });
        return {
            totalRequests: requests.length,
            data: requests.map((r) => this.toView(r)),
        };
    }

    async findOne(user: AuthUser, id: number) {
        const request = await this.loadWithAccess(user, id);
        return {
            ...this.toView(request),
            history: request.updates.map((u) => this.toHistoryView(u)),
        };
    }

    async getHistory(user: AuthUser, id: number) {
        const request = await this.loadWithAccess(user, id);
        return {
            requestId: request.id,
            totalUpdates: request.updates.length,
            data: request.updates.map((u) => this.toHistoryView(u)),
        };
    }

    async changeStatus(user: AuthUser, id: number, dto: UpdateStatusDTO) {
        // request update + history insert in one transaction
        return this.dataSource.transaction(async (manager) => {
            const request = await manager.findOne(MaintenanceRequest, {
                where: { id },
                relations: { flat: { owner: true }, tenant: true },
            });
            if (!request) {
                throw new NotFoundException(`Maintenance request ${id} not found`);
            }
            if (request.flat.owner.id !== user.id) {
                throw new ForbiddenException('This request is not for one of your flats');
            }
            const oldStatus: MaintenanceStatus = request.status;
            if (!isValidTransition(oldStatus, dto.newStatus)) {
                throw new BadRequestException(
                    `Cannot change status from ${oldStatus} to ${dto.newStatus}`,
                );
            }
            request.status = dto.newStatus;
            await manager.save(request);
            const update = manager.create(MaintenanceUpdate, {
                request: { id: request.id } as MaintenanceRequest,
                user: { id: user.id } as Users,
                oldStatus,
                newStatus: dto.newStatus,
                comment: dto.comment ?? null,
            });
            const savedUpdate = await manager.save(update);
            return {
                message: `Status changed from ${oldStatus} to ${dto.newStatus}`,
                data: {
                    ...this.toView(request),
                    historyId: savedUpdate.id,
                },
            };
        });
    }
}