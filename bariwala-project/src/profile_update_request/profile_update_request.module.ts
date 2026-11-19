import { Module } from '@nestjs/common';
import { ProfileUpdateRequestService } from './profile_update_request.service.js';
import { ProfileUpdateRequestController } from './profile_update_request.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUpdateRequest } from './entities/profile_update_request.entity.js';
import { Users } from '../users/entities/users.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { FamilyMember } from '../family-members/entities/family-member.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileUpdateRequest, Users, Flat, FamilyMember])],
  controllers: [ProfileUpdateRequestController],
  providers: [ProfileUpdateRequestService],
  exports: [ProfileUpdateRequestService],
})
export class ProfileUpdateRequestModule {}
