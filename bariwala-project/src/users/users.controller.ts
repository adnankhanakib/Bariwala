import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/create')
  createUser(@Body() createUserDto:CreateUserDTO){
    return this.usersService.create(createUserDto)
  }
}
