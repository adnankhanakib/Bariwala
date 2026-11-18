import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';
import { Users } from './entities/users.entity.js';
import { UpdateUserDTO } from './dtos/update-user.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  
  @Post('/create')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  createUser(@Body() createUserDto:CreateUserDTO){
    return this.usersService.create(createUserDto)
  }
  @Get()
  @UseGuards(JwtGuard,RolesGuard)
  @Roles('admin')
  showAllUsers():Promise<Users[]>{
    return this.usersService.showAllUsers();
  }
  @Get(':id')
  @UseGuards(JwtGuard,RolesGuard)
  @Roles('admin')
  getUserByID(@Param('id',ParseIntPipe) id:number):Promise<Object>{
    return this.usersService.getUserByID(id);
  }
  @Patch(':id')
  @UseGuards(JwtGuard,RolesGuard)
  @Roles('admin')
  async patchByID(@Param('id',ParseIntPipe) id:number, @Body() user:UpdateUserDTO){
    return await this.usersService.updateUser(id,user)
  }
  @Delete(':id')
  @UseGuards(JwtGuard,RolesGuard)
  @Roles('admin')
  async deleteByID(@Param('id',ParseIntPipe) id:number){
    return this.usersService.deleteUser(id)
  }

  @Post('/populate')
  async createDummy(){
    return this.usersService.populateDB()
  }

}
