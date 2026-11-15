import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';
import { Users } from './entities/users.entity.js';
import { UpdateUserDTO } from './dtos/update-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/create')
  createUser(@Body() createUserDto:CreateUserDTO){
    return this.usersService.create(createUserDto)
  }
  @Get()
  showAllUsers():Promise<Users[]>{
    return this.usersService.showAllUsers();
  }
  @Get(':id')
  getUserByID(@Param('id') id:number):Promise<Object>{
    return this.usersService.getUserByID(id);
  }
  @Patch(':id')
  async patchByID(@Param('id') id:number, @Body() user:UpdateUserDTO){
    return await this.usersService.updateUser(id,user)
  }
  @Delete(':id')
  async deleteByID(@Param('id') id:number){
    return this.usersService.deleteUser(id)
  }
}
