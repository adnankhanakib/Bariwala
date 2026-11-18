import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { MaintenanceRequest } from './entities/maintenance-request.entity.js';
import { WorkOrder } from './entities/work-order.entity.js';
import { Users } from '../users/entities/users.entity.js';
import { CreateWorkOrderDTO } from './dtos/create-work-order.dto.js';
import { UpdateWorkOrderDTO } from './dtos/update-work-order.dto.js';
import { UpdateWorkOrderStatusDTO } from './dtos/update-work-order-status.dto.js';
import { ListWorkOrderQueryDTO } from './dtos/list-work-order-query.dto.js';
import { buildMeta } from './dtos/pagination-query.dto.js';
import { MaintenancePriority } from './enums/maintenance-priority.enum.js';
import { MaintenanceStatus } from './enums/maintenance-status.enum.js';
import { WorkOrderStatus } from './enums/work-order-status.enum.js';
import { isValidWorkOrderTransition } from './status-transition.js';
import type { AuthUser } from './types/auth-user.js';

@Injectable()
export class WorkOrdersService {
    constructor(private readonly dataSource: DataSource) {}

    private toView(w: WorkOrder) {
        return {
            id: w.id,
            maintenanceRequestId: w.maintenanceRequestId,
            title: w.title,
            workDescription: w.workDescription,
            assignedToUserId: w.assignedToUserId,
            priority: w.priority,
            status: w.status,
            scheduledDate: w.scheduledDate,
            completedAt: w.completedAt,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
        };
    }

    
    private assertCanManage(user: AuthUser, flatOwnerId: number) {
        if (user.role === 'admin') return;
        if (user.role === 'owner' && user.id === flatOwnerId) return;
        throw new ForbiddenException('This work order is not for one of your flats');
    }

    private async ensureUserExists(manager: EntityManager, userId: number) {
        const found = await manager.findOneBy(Users, { id: userId });
        if (!found) {
            throw new NotFoundException(`Assigned user ${userId} not found`);
        }
    }

    private async loadForManage(manager: EntityManager, user: AuthUser, id: number) {
        const workOrder = await manager.findOne(WorkOrder, {
            where: { id },
            relations: { maintenanceRequest: { flat: { owner: true } } },
        });
        if (!workOrder) {
            throw new NotFoundException(`Work order ${id} not found`);
        }
        this.assertCanManage(user, workOrder.maintenanceRequest.flat.owner.id);
        return workOrder;
    }

    
    private async syncRequestStatus(manager: EntityManager, requestId: number) {
        const request = await manager.findOneBy(MaintenanceRequest, { id: requestId });
        if (!request || request.status === MaintenanceStatus.REJECTED) return;

        const orders = await manager.find(WorkOrder, { where: { maintenanceRequestId: requestId } });
        const anyInProgress = orders.some((o) => o.status === WorkOrderStatus.IN_PROGRESS);
        const anyScheduled = orders.some((o) => o.status === WorkOrderStatus.SCHEDULED);
        const anyCompleted = orders.some((o) => o.status === WorkOrderStatus.COMPLETED);

        let next: MaintenanceStatus;
        if (anyInProgress || (anyScheduled && anyCompleted)) {
            next = MaintenanceStatus.IN_PROGRESS;
        } else if (anyScheduled) {
            next = MaintenanceStatus.ACCEPTED;
        } else if (anyCompleted) {
            next = MaintenanceStatus.RESOLVED; 
        } else {
            
            next = request.status === MaintenanceStatus.SUBMITTED
                ? MaintenanceStatus.SUBMITTED
                : MaintenanceStatus.ACCEPTED;
        }
        if (next !== request.status) {
            await manager.update(MaintenanceRequest, requestId, { status: next });
        }
    }

    // POST /maintenance-requests/:requestId/work-orders
    async create(user: AuthUser, requestId: number, dto: CreateWorkOrderDTO) {
        return this.dataSource.transaction(async (manager) => {
            const request = await manager.findOne(MaintenanceRequest, {
                where: { id: requestId },
                relations: { flat: { owner: true } },
            });
            if (!request) {
                throw new NotFoundException(`Maintenance request ${requestId} not found`);
            }
            this.assertCanManage(user, request.flat.owner.id);
            if (
                request.status === MaintenanceStatus.REJECTED ||
                request.status === MaintenanceStatus.RESOLVED
            ) {
                throw new BadRequestException(
                    `Cannot create a work order for a ${request.status} request`,
                );
            }
            if (dto.assignedToUserId !== undefined) {
                await this.ensureUserExists(manager, dto.assignedToUserId);
            }
            const workOrder = manager.create(WorkOrder, {
                maintenanceRequestId: request.id,
                title: dto.title,
                workDescription: dto.workDescription ?? null,
                assignedToUserId: dto.assignedToUserId ?? null,
                priority: dto.priority ?? request.priority,
                scheduledDate: dto.scheduledDate ?? null,
                status: WorkOrderStatus.SCHEDULED,
                completedAt: null,
            });
            const saved = await manager.save(workOrder);
            await this.syncRequestStatus(manager, request.id);
            return this.toView(saved);
        });
    }

    // GET /work-orders
    async findAll(user: AuthUser, query: ListWorkOrderQueryDTO) {
        const { page, limit } = query;
        const qb = this.dataSource.getRepository(WorkOrder).createQueryBuilder('w');

        if (user.role !== 'admin') {
            qb.innerJoin('w.maintenanceRequest', 'r')
                .innerJoin('r.flat', 'flat')
                .innerJoin('flat.owner', 'owner')
                .andWhere('owner.id = :ownerId', { ownerId: user.id });
        }
        if (query.status) {
            qb.andWhere('w.status = :status', { status: query.status });
        }
        if (query.priority) {
            qb.andWhere('w.priority = :priority', { priority: query.priority });
        }
        if (query.maintenanceRequestId !== undefined) {
            qb.andWhere('w.maintenanceRequestId = :mrId', { mrId: query.maintenanceRequestId });
        }
        if (query.assignedToUserId !== undefined) {
            qb.andWhere('w.assignedToUserId = :assignee', { assignee: query.assignedToUserId });
        }
        if (query.scheduledFrom) {
            qb.andWhere('w.scheduledDate >= :scheduledFrom', { scheduledFrom: query.scheduledFrom });
        }
        if (query.scheduledTo) {
            qb.andWhere('w.scheduledDate <= :scheduledTo', { scheduledTo: query.scheduledTo });
        }

        const [rows, total] = await qb
            .orderBy('w.createdAt', 'DESC')
            .addOrderBy('w.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: rows.map((w) => this.toView(w)),
            meta: buildMeta(total, page, limit),
        };
    }

    // GET /work-orders/:id
    async findOne(user: AuthUser, id: number) {
        const workOrder = await this.loadForManage(this.dataSource.manager, user, id);
        return this.toView(workOrder);
    }

    // PATCH /work-orders/:id
    async update(user: AuthUser, id: number, dto: UpdateWorkOrderDTO) {
        return this.dataSource.transaction(async (manager) => {
            const workOrder = await this.loadForManage(manager, user, id);
            if (
                workOrder.status === WorkOrderStatus.COMPLETED ||
                workOrder.status === WorkOrderStatus.CANCELLED
            ) {
                throw new BadRequestException(`A ${workOrder.status} work order cannot be edited`);
            }
            const changes: {
                title?: string;
                workDescription?: string | null;
                assignedToUserId?: number | null;
                priority?: MaintenancePriority;
                scheduledDate?: string | null;
            } = {};
            if (dto.title !== undefined) changes.title = dto.title;
            if (dto.workDescription !== undefined) changes.workDescription = dto.workDescription;
            if (dto.priority !== undefined) changes.priority = dto.priority;
            if (dto.scheduledDate !== undefined) changes.scheduledDate = dto.scheduledDate;
            if (dto.assignedToUserId !== undefined) {
                
                if (dto.assignedToUserId !== null) {
                    await this.ensureUserExists(manager, dto.assignedToUserId);
                }
                changes.assignedToUserId = dto.assignedToUserId ?? null;
            }
            if (Object.keys(changes).length > 0) {
                await manager.update(WorkOrder, id, changes);
            }
            const fresh = await manager.findOneBy(WorkOrder, { id });
            return this.toView(fresh!);
        });
    }

    // PATCH /work-orders/:id/status
    async changeStatus(user: AuthUser, id: number, dto: UpdateWorkOrderStatusDTO) {
        return this.dataSource.transaction(async (manager) => {
            const workOrder = await this.loadForManage(manager, user, id);
            if (!isValidWorkOrderTransition(workOrder.status, dto.status)) {
                throw new BadRequestException(
                    `Cannot change work order status from ${workOrder.status} to ${dto.status}`,
                );
            }
            await manager.update(WorkOrder, id, {
                status: dto.status,
                completedAt: dto.status === WorkOrderStatus.COMPLETED ? new Date() : null,
            });
            
            await this.syncRequestStatus(manager, workOrder.maintenanceRequestId);
            const fresh = await manager.findOneBy(WorkOrder, { id });
            return this.toView(fresh!);
        });
    }

    // DELETE /work-orders/:id
    async remove(user: AuthUser, id: number) {
        return this.dataSource.transaction(async (manager) => {
            const workOrder = await this.loadForManage(manager, user, id);
            await manager.delete(WorkOrder, id);
            await this.syncRequestStatus(manager, workOrder.maintenanceRequestId);
            return { message: `Work order ${id} deleted successfully` };
        });
    }
}