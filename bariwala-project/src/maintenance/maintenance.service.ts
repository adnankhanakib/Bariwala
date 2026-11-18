import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequest } from './entities/maintenance-request.entity.js';
import { Tenant } from './stubs/tenant.stub.entity.js';
import { CreateMaintenanceDTO } from './dtos/create-maintenance.dto.js';
import { UpdateMaintenanceDTO } from './dtos/update-maintenance.dto.js';
import { UpdateStatusDTO } from './dtos/update-status.dto.js';
import { ListMaintenanceQueryDTO } from './dtos/list-maintenance-query.dto.js';
import { buildMeta } from './dtos/pagination-query.dto.js';
import { MaintenancePriority } from './enums/maintenance-priority.enum.js';
import { MaintenanceStatus } from './enums/maintenance-status.enum.js';
import { isValidTransition } from './status-transition.js';
import type { AuthUser } from './types/auth-user.js';

const CLOSED_STATUSES = [MaintenanceStatus.RESOLVED, MaintenanceStatus.REJECTED];

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(MaintenanceRequest)
        private readonly requestRepo: Repository<MaintenanceRequest>,
        @InjectRepository(Tenant)
        private readonly tenantRepo: Repository<Tenant>,
    ) {}

    
    private toView(r: MaintenanceRequest) {
        return {
            id: r.id,
            tenantUserId: r.tenantUserId,
            flatId: r.flatId,
            title: r.title,
            description: r.description,
            priority: r.priority,
            status: r.status,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        };
    }

    private assertAccess(user: AuthUser, request: MaintenanceRequest) {
        const isAdmin = user.role === 'admin';
        const isOwner = user.role === 'owner' && request.flat.owner.id === user.id;
        const isTenant = user.role === 'tenant' && request.tenantUserId === user.id;
        if (!isAdmin && !isOwner && !isTenant) {
            throw new ForbiddenException('You cannot access this maintenance request');
        }
    }

    private async loadWithAccess(user: AuthUser, id: number) {
        const request = await this.requestRepo.findOne({
            where: { id },
            relations: { flat: { owner: true } },
        });
        if (!request) {
            throw new NotFoundException(`Maintenance request ${id} not found`);
        }
        this.assertAccess(user, request);
        return request;
    }


    private async list(
        query: ListMaintenanceQueryDTO,
        scope: { ownerId?: number; tenantUserId?: number },
    ) {
        const { page, limit } = query;
        const qb = this.requestRepo.createQueryBuilder('r');

        if (scope.ownerId !== undefined) {
            qb.innerJoin('r.flat', 'flat')
                .innerJoin('flat.owner', 'owner')
                .andWhere('owner.id = :ownerId', { ownerId: scope.ownerId });
        }
        if (scope.tenantUserId !== undefined) {
            qb.andWhere('r.tenantUserId = :tenantUserId', { tenantUserId: scope.tenantUserId });
        }
        if (query.status) {
            qb.andWhere('r.status = :status', { status: query.status });
        }
        if (query.priority) {
            qb.andWhere('r.priority = :priority', { priority: query.priority });
        }
        if (query.flatId !== undefined) {
            qb.andWhere('r.flatId = :flatId', { flatId: query.flatId });
        }
        if (query.dateFrom) {
            qb.andWhere('r.createdAt >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
        }
        if (query.dateTo) {
            const end = new Date(query.dateTo);
            if (query.dateTo.length === 10) {
                end.setUTCHours(23, 59, 59, 999); 
            }
            qb.andWhere('r.createdAt <= :dateTo', { dateTo: end });
        }

        const [rows, total] = await qb
            .orderBy('r.createdAt', 'DESC')
            .addOrderBy('r.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: rows.map((r) => this.toView(r)),
            meta: buildMeta(total, page, limit),
        };
    }

    async create(user: AuthUser, dto: CreateMaintenanceDTO) {
        // the tenant must currently rent the flat he is reporting about
        const tenant = await this.tenantRepo.findOne({
            where: { user: { id: user.id }, flat: { id: dto.flatId } },
        });
        if (!tenant) {
            throw new ForbiddenException('You can only report a problem for a flat you currently rent');
        }
        const request = this.requestRepo.create({
            flatId: dto.flatId,
            tenantUserId: user.id,
            title: dto.title,
            description: dto.description,
            priority: dto.priority ?? MaintenancePriority.MEDIUM,
            status: MaintenanceStatus.SUBMITTED,
        });
        const saved = await this.requestRepo.save(request);
        return this.toView(saved);
    }

    
    findAll(user: AuthUser, query: ListMaintenanceQueryDTO) {
        return this.list(query, user.role === 'admin' ? {} : { ownerId: user.id });
    }

    // GET /tenants/me/maintenance-requests  (tenant)
    findMine(user: AuthUser, query: ListMaintenanceQueryDTO) {
        return this.list(query, { tenantUserId: user.id });
    }

    async findOne(user: AuthUser, id: number) {
        const request = await this.loadWithAccess(user, id);
        return this.toView(request);
    }

    async update(user: AuthUser, id: number, dto: UpdateMaintenanceDTO) {
        const request = await this.loadWithAccess(user, id);
        if (CLOSED_STATUSES.includes(request.status)) {
            throw new BadRequestException(`A ${request.status} request cannot be edited`);
        }
        if (user.role === 'tenant' && request.status !== MaintenanceStatus.SUBMITTED) {
            throw new BadRequestException('You can only edit a request while it is still submitted');
        }
        const changes: { title?: string; description?: string; priority?: MaintenancePriority } = {};
        if (dto.title !== undefined) changes.title = dto.title;
        if (dto.description !== undefined) changes.description = dto.description;
        if (dto.priority !== undefined) changes.priority = dto.priority;
        if (Object.keys(changes).length > 0) {
            await this.requestRepo.update(id, changes);
        }
        const fresh = await this.requestRepo.findOneBy({ id });
        return this.toView(fresh!);
    }

    async remove(user: AuthUser, id: number) {
        const request = await this.loadWithAccess(user, id);
        if (request.status !== MaintenanceStatus.SUBMITTED) {
            throw new BadRequestException('Only a submitted request can be deleted');
        }
        await this.requestRepo.delete(id);
        return { message: `Maintenance request ${id} deleted successfully` };
    }

    
    async changeStatus(user: AuthUser, id: number, dto: UpdateStatusDTO) {
        const request = await this.loadWithAccess(user, id);
        if (!isValidTransition(request.status, dto.status)) {
            throw new BadRequestException(
                `Cannot change status from ${request.status} to ${dto.status}`,
            );
        }
        await this.requestRepo.update(id, { status: dto.status });
        const fresh = await this.requestRepo.findOneBy({ id });
        return this.toView(fresh!);
    }
}