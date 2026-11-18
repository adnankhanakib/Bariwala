import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO } from './dto/login.dto.js';
import { RegisterUserDTO } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/login')
  async loginUser(@Body() data:LoginDTO){
    return await this.authService.login(data)
  }
  @Post('/register')
  async registerUser(@Body() data:RegisterUserDTO){
    return await this.authService.register(data)
  }
}
