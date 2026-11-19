
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';

import { ProfileUpdateRequestService } from './profile_update_request.service.js';
import { CreateProfileUpdateRequestDto } from './dto/create-profile_update_request.dto.js';
import { UpdateProfileUpdateRequestDto } from './dto/update-profile_update_request.dto.js';

import { JwtGuard } from '../auth/jwtGuard.guard.js';

@Controller('profile-update-requests')
@UseGuards(JwtGuard)
export class ProfileUpdateRequestController {
  constructor(private readonly requestService: ProfileUpdateRequestService) {}

  @Post()
  create(@Body() dto: CreateProfileUpdateRequestDto,@Req() req: any) 
  {
    if (req.user.role !== 'tenant') {throw new ForbiddenException('Only tenants can submit requests');}
    return this.requestService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Req() req: any) 
  {
    return this.requestService.findAll(
      req.user.id,
      req.user.role,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number,@Req() req: any) 
  {
    return this.requestService.findOne(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,@Body() dto: UpdateProfileUpdateRequestDto,@Req() req: any) {
    if (req.user.role !== 'tenant') {
      throw new ForbiddenException('Only tenants can edit requests');
    }
    return this.requestService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number,@Req() req: any) 
  {
    if (req.user.role !== 'tenant') {throw new ForbiddenException('Only tenants can cancel requests');}
    return this.requestService.remove(id, req.user.id);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number,@Req() req: any) 
  {
    return this.requestService.approve(
      id,
      req.user.id,
      req.user.role,
    );
  }

  @Patch(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number,@Body() body: { note?: string },@Req() req: any) 
  {
    return this.requestService.reject(
      id,
      req.user.id,
      req.user.role,
      body?.note,
    );
  }
}
