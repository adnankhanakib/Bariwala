import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/users.entity.js';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDTO } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService:UsersService,
    private readonly jwtService:JwtService,
  ){}
  async login(data:LoginDTO){
    const user = await this.userService.getUserByEmail(data.email)
    if(!user){
      throw new InternalServerErrorException("Something went wrong while checking")
    }

    const passCheck = await bcrypt.compare(data.password, user.passwordHash)
    if(!passCheck){
      throw new UnauthorizedException("Email or password is invalid")
    }
    const payload = {
      id:user.id,
      email:user.email,
      role:user.role,
    }
    const access_token = this.jwtService.sign(payload)
    const {passwordHash,...dataWithoutPass} = user;
    return {
      data:dataWithoutPass,
      access_token:access_token
    }
  }
  async register(data:RegisterUserDTO){
    return await this.userService.create(data)
  }
}
