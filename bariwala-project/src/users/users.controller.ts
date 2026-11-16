import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';
import { Users } from './entities/users.entity.js';
import { UpdateUserDTO } from './dtos/update-user.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/create')
  @UseGuards(JwtGuard)
  createUser(@Body() createUserDto:CreateUserDTO){
    return this.usersService.create(createUserDto)
  }
  @Get()
  @UseGuards(JwtGuard)
  showAllUsers():Promise<Users[]>{
    return this.usersService.showAllUsers();
  }
  @Get(':id')
  @UseGuards(JwtGuard)
  getUserByID(@Param('id') id:number):Promise<Object>{
    return this.usersService.getUserByID(id);
  }
  @Patch(':id')
  @UseGuards(JwtGuard)
  async patchByID(@Param('id') id:number, @Body() user:UpdateUserDTO){
    return await this.usersService.updateUser(id,user)
  }
  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteByID(@Param('id') id:number){
    return this.usersService.deleteUser(id)
  }
}
