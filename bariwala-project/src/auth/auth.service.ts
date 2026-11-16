import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../users/entities/users.entity.js';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService:UsersService
  ){}
  async login(data:LoginDTO){
    const user = await this.userService.getUserByEmail(data.email)
    if(user){
      const passCheck = await bcrypt.compare(data.password, user.passwordHash)
      if(passCheck){
        const {passwordHash,...dataWithoutPass} = user;
        return {
          data:dataWithoutPass
        }
      }else{
        throw new UnauthorizedException("Email or password is invalid")
      }
      
    }else{
      throw new InternalServerErrorException("Something went wrong while checking")
    }
  }
}
