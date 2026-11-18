
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

import { FamilyMembersService } from './family-members.service.js';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto.js';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';

@Controller('tenants/me/family-members')
@UseGuards(JwtGuard)
export class FamilyMembersController {
  constructor(private readonly familyMembersService: FamilyMembersService) {}

  @Post()
  create(@Body() dto: CreateFamilyMemberDto,@Req() req: any) 
  {
    this.checkTenant(req.user.role);
    return this.familyMembersService.create( dto,req.user.id);
  }

  @Get()
  findAll(@Req() req: any) 
  {
    this.checkTenant(req.user.role);
    return this.familyMembersService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number,@Req() req: any) 
  {
    this.checkTenant(req.user.role);
    return this.familyMembersService.findOne(id,req.user.id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,@Body() dto: UpdateFamilyMemberDto,@Req() req: any) 
  {
    this.checkTenant(req.user.role);
    return this.familyMembersService.update(id,dto,req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number,@Req() req: any)
  {
    this.checkTenant(req.user.role);
    return this.familyMembersService.remove(id,req.user.id);
   }

  private checkTenant(role: string) 
  {
    if (role !== 'tenant') 
      {
      throw new ForbiddenException('Only tenants can access these endpoints');
      }
  }
}
