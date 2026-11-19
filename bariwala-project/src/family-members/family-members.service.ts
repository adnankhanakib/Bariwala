
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FamilyMember } from './entities/family-member.entity.js';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto.js';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto.js';

import { ProfileUpdateRequestService } from '../profile_update_request/profile_update_request.service.js';

@Injectable()
export class FamilyMembersService {
  constructor(
    @InjectRepository(FamilyMember)
    private readonly familyRepo: Repository<FamilyMember>,
    private readonly requestService: ProfileUpdateRequestService,
  ) {}

  async create(dto: CreateFamilyMemberDto,tenantId: number)
   {
    return this.requestService.create(
      {
        requestType: 'family_add',
        requestedChanges: { ...dto },
      },
      tenantId
    );
   }

  async findAll(tenantId: number) {
    return this.familyRepo.find({
      where: {
        tenant: { id: tenantId },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number, tenantId: number) {
    const member = await this.familyRepo.findOne({
      where: 
      {
        id,tenant: { id: tenantId },
      },
    });

    if (!member) {
      throw new NotFoundException('Family member not found');
    }

    return member;
  }

  async update(
    id: number,
    dto: UpdateFamilyMemberDto,
    tenantId: number,
  ) {
    await this.findOne(id, tenantId);
    return this.requestService.create(
      {
        requestType: 'family_update',
        familyMemberId: id,
        requestedChanges: { ...dto },
      },
      tenantId,
    );
  }

  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId);

    return this.requestService.create(
      {
        requestType: 'family_delete',
        familyMemberId: id,
      },
      tenantId,
    );
  }
}
