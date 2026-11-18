
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ProfileUpdateRequest } from './entities/profile_update_request.entity.js';
import { CreateProfileUpdateRequestDto } from './dto/create-profile_update_request.dto.js';
import { UpdateProfileUpdateRequestDto } from './dto/update-profile_update_request.dto.js';

import { Users } from '../users/entities/users.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { FamilyMember } from '../family-members/entities/family-member.entity.js';
import { CreateFamilyMemberDto } from '../family-members/dto/create-family-member.dto.js';
import { UpdateFamilyMemberDto } from '../family-members/dto/update-family-member.dto.js';

@Injectable()
export class ProfileUpdateRequestService {
  constructor(
    @InjectRepository(ProfileUpdateRequest)
    private readonly requestRepo: Repository<ProfileUpdateRequest>,

    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,

    @InjectRepository(Flat)
    private readonly flatRepo: Repository<Flat>,

    @InjectRepository(FamilyMember)
    private readonly familyRepo: Repository<FamilyMember>,

    private readonly dataSource: DataSource,
  ) {}

  // Check if an owner manages the tenant's flat
  private async checkOwner(
    tenantId: number,
    ownerId: number,
  ): Promise<boolean> {
    const flat = await this.flatRepo.findOne({
      where: {
        tenant: { id: tenantId },
        owner: { id: ownerId },
      },
    });

    return !!flat;
  }

  // Check permission to access a tenant's records
  private async checkAccess(
    tenantId: number,
    userId: number,
    role: string,
  ) {
    if (role === 'admin') return;

    if (role === 'tenant' && tenantId === userId) {
      return;
    }

    if (
      role === 'owner' &&
      (await this.checkOwner(tenantId, userId))
    ) {
      return;
    }

    throw new ForbiddenException('Access denied');
  }

  // Find a request or return 404
  private async getRequest(id: number) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: {'tenant': true, 'familyMember': true, 'reviewedBy': true},
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  // Validate proposed family-member data
  private validateFamilyChanges(
    changes: Record<string, unknown> | undefined,
    isCreate: boolean,
  ) {
    if (
      !changes ||
      typeof changes !== 'object' ||
      Array.isArray(changes) ||
      Object.keys(changes).length === 0
    ) {
      throw new BadRequestException(
        'Family member changes are required',
      );
    }

    const DtoClass = isCreate
      ? CreateFamilyMemberDto
      : UpdateFamilyMemberDto;

    const dto = plainToInstance(DtoClass, changes);

    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(
        'Invalid family member information',
      );
    }

    return dto;
  }

  // CREATE - Tenant submits a request
  async create(
    dto: CreateProfileUpdateRequestDto,
    tenantId: number,
  ) {
    const tenant = await this.userRepo.findOneBy({
      id: tenantId,
      role: 'tenant',
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    const type = dto.requestType;

    let familyMember: FamilyMember | null = null;
    let changes: Record<string, unknown> | null = null;

    if (type === 'profile') {
      if (!dto.requestedName && !dto.requestedPhone) {
        throw new BadRequestException(
          'Provide a name or phone to update',
        );
      }
    } else if (type === 'family_add') {
      const valid = this.validateFamilyChanges(
        dto.requestedChanges,
        true,
      );
      changes = { ...valid };
    } else if (
      type === 'family_update' ||
      type === 'family_delete'
    ) {
      if (!dto.familyMemberId) {
        throw new BadRequestException(
          'Family member ID is required',
        );
      }

      familyMember = await this.familyRepo.findOne({
        where: {
          id: dto.familyMemberId,
          tenant: { id: tenantId },
        },
      });

      if (!familyMember) {
        throw new NotFoundException(
          'Family member not found',
        );
      }

      if (type === 'family_update') {
        const valid = this.validateFamilyChanges(
          dto.requestedChanges,
          false,
        );
        changes = { ...valid };
      }

      // Avoid conflicting requests for the same member
      const existing = await this.requestRepo
        .createQueryBuilder('request')
        .leftJoin('request.familyMember', 'member')
        .where('member.id = :id', {
          id: familyMember.id,
        })
        .andWhere('request.status = :status', {
          status: 'pending',
        })
        .getOne();

      if (existing) {
        throw new ConflictException(
          'This family member already has a pending request',
        );
      }
    } else {
      throw new BadRequestException(
        'Invalid request type',
      );
    }

    const request = this.requestRepo.create({
      tenant,
      requestType: type,
      familyMember,
      requestedName:
        type === 'profile' ? dto.requestedName ?? null : null,
      requestedPhone:
        type === 'profile' ? dto.requestedPhone ?? null : null,
      requestedChanges: changes,
      reason: dto.reason ?? null,
      status: 'pending',
    });

    const saved = await this.requestRepo.save(request);

    return {
      message: 'Request submitted successfully',
      id: saved.id,
      status: saved.status,
    };
  }

  // READ ALL - Based on user role
  async findAll(userId: number, role: string) {
    const query = this.requestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.tenant', 'tenant')
      .leftJoinAndSelect(
        'request.familyMember',
        'familyMember',
      )
      .select([
        'request',
        'tenant.id',
        'tenant.name',
        'tenant.email',
        'familyMember',
      ])
      .orderBy('request.submittedAt', 'DESC');

    if (role === 'tenant') {
      query.where('tenant.id = :userId', { userId });
    } else if (role === 'owner') {
      const flats = await this.flatRepo.find({
        where: { owner: { id: userId } },
        relations: { tenant: true },
      });

      const tenantIds = flats
        .filter((flat) => flat.tenant)
        .map((flat) => flat.tenant!.id);

      if (tenantIds.length === 0) return [];

      query.where('tenant.id IN (:...tenantIds)', {
        tenantIds,
      });
    } else if (role !== 'admin') {
      throw new ForbiddenException('Access denied');
    }

    return query.getMany();
  }

  // READ ONE
  async findOne(
    id: number,
    userId: number,
    role: string,
  ) {
    const request = await this.getRequest(id);

    await this.checkAccess(
      request.tenant.id,
      userId,
      role,
    );

    return {
      id: request.id,
      tenantId: request.tenant.id,
      requestType: request.requestType,
      familyMemberId: request.familyMember?.id ?? null,
      requestedName: request.requestedName,
      requestedPhone: request.requestedPhone,
      requestedChanges: request.requestedChanges,
      reason: request.reason,
      status: request.status,
      reviewNote: request.reviewNote,
      submittedAt: request.submittedAt,
      reviewedAt: request.reviewedAt,
    };
  }

  // UPDATE - Tenant edits a pending request
  async update(
    id: number,
    dto: UpdateProfileUpdateRequestDto,
    tenantId: number,
  ) {
    const request = await this.getRequest(id);

    if (request.tenant.id !== tenantId) {
      throw new ForbiddenException('Not your request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(
        'Only pending requests can be updated',
      );
    }

    if (
      dto.requestType !== undefined &&
      dto.requestType !== request.requestType
    ) {
      throw new BadRequestException(
        'Request type cannot be changed',
      );
    }

    if (dto.familyMemberId !== undefined) {
      throw new BadRequestException(
        'Family member ID cannot be changed',
      );
    }

    if (request.requestType === 'profile') {
      if (dto.requestedChanges !== undefined) {
        throw new BadRequestException(
          'Family changes are not allowed here',
        );
      }

      if (dto.requestedName !== undefined) {
        request.requestedName = dto.requestedName;
      }

      if (dto.requestedPhone !== undefined) {
        request.requestedPhone = dto.requestedPhone;
      }

      if (!request.requestedName && !request.requestedPhone) {
        throw new BadRequestException(
          'Name or phone is required',
        );
      }
    } else {
      if (
        dto.requestedName !== undefined ||
        dto.requestedPhone !== undefined
      ) {
        throw new BadRequestException(
          'Profile fields are not allowed here',
        );
      }

      if (dto.requestedChanges !== undefined) {
        if (request.requestType === 'family_delete') {
          throw new BadRequestException(
            'Delete requests cannot contain changes',
          );
        }

        const valid = this.validateFamilyChanges(
          dto.requestedChanges,
          request.requestType === 'family_add',
        );

        request.requestedChanges = { ...valid };
      }
    }

    if (dto.reason !== undefined) {
      request.reason = dto.reason;
    }

    await this.requestRepo.save(request);

    return { message: 'Pending request updated' };
  }

  // DELETE - Cancel a pending request
  async remove(id: number, tenantId: number) {
    const request = await this.getRequest(id);

    if (request.tenant.id !== tenantId) {
      throw new ForbiddenException('Not your request');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(
        'Only pending requests can be cancelled',
      );
    }

    await this.requestRepo.remove(request);

    return { message: 'Request cancelled successfully' };
  }

  // APPROVE - Apply changes in a transaction
  async approve(
    id: number,
    reviewerId: number,
    role: string,
  ) {
    if (!['owner', 'admin'].includes(role)) {
      throw new ForbiddenException('Not allowed');
    }

    const request = await this.getRequest(id);

    await this.checkAccess(
      request.tenant.id,
      reviewerId,
      role,
    );

    if (request.status !== 'pending') {
      throw new BadRequestException(
        'Request already reviewed',
      );
    }

    await this.dataSource.transaction(async (manager) => {
      // Re-read and lock to prevent double approval
      const current = await manager.findOne(
        ProfileUpdateRequest,
        {
          where: { id },
          relations: { tenant: true, familyMember: true },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!current || current.status !== 'pending') {
        throw new ConflictException(
          'Request is no longer pending',
        );
      }

      if (current.requestType === 'profile') {
        const user = await manager.findOneBy(Users, {
          id: current.tenant.id,
        });

        if (!user) {
          throw new NotFoundException('Tenant not found');
        }

        if (current.requestedName) {
          user.name = current.requestedName;
        }

        if (current.requestedPhone) {
          user.phone = current.requestedPhone;
        }

        await manager.save(user);
      } else if (current.requestType === 'family_add') {
        const changes = this.validateFamilyChanges(
          current.requestedChanges ?? undefined,
          true,
        );

        const member = manager.create(FamilyMember, {
          ...changes,
          tenant: current.tenant,
        });

        await manager.save(member);
        current.familyMember = member;
      } else if (
        current.requestType === 'family_update' ||
        current.requestType === 'family_delete'
      ) {
        const member = await manager.findOne(FamilyMember, {
          where: {
            id: current.familyMember?.id,
            tenant: { id: current.tenant.id },
          },
        });

        if (!member) {
          throw new NotFoundException(
            'Family member no longer exists',
          );
        }

        if (current.requestType === 'family_update') {
          const changes = this.validateFamilyChanges(
            current.requestedChanges ?? undefined,
            false,
          );

          Object.assign(member, changes);
          await manager.save(member);
        } else {
          // Preserve request history when deleting a member
          current.familyMember = null;
          await manager.remove(member);
        }
      } else {
        throw new BadRequestException(
          'Unknown request type',
        );
      }

      current.status = 'approved';
      current.reviewedBy = { id: reviewerId } as Users;
      current.reviewedAt = new Date();

      await manager.save(current);
    });

    return { message: 'Request approved successfully' };
  }

  // REJECT - Keep original data unchanged
  async reject(
    id: number,
    reviewerId: number,
    role: string,
    note?: string,
  ) {
    if (!['owner', 'admin'].includes(role)) {
      throw new ForbiddenException('Not allowed');
    }

    const request = await this.getRequest(id);

    await this.checkAccess(
      request.tenant.id,
      reviewerId,
      role,
    );

    await this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(
        ProfileUpdateRequest,
        {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!current || current.status !== 'pending') {
        throw new BadRequestException(
          'Request already reviewed',
        );
      }

      current.status = 'rejected';
      current.reviewedBy = { id: reviewerId } as Users;
      current.reviewNote = note ?? null;
      current.reviewedAt = new Date();

      await manager.save(current);
    });

    return { message: 'Request rejected successfully' };
  }
}
