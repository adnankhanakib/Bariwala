import { Module } from '@nestjs/common';
import { FamilyMembersService } from './family-members.service.js';
import { FamilyMembersController } from './family-members.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyMember } from './entities/family-member.entity.js';
import { Users } from '../users/entities/users.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { ProfileUpdateRequestModule } from '../profile_update_request/profile_update_request.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyMember, Users, Flat]), ProfileUpdateRequestModule],
  controllers: [FamilyMembersController],
  providers: [FamilyMembersService],
})
export class FamilyMembersModule {}
