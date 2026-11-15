import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepo:Repository<Users>
    ){}
    async create(CreateUserDTO:CreateUserDTO):Promise<Object>{
        const user = this.usersRepo.create(CreateUserDTO);
        const res = await this.usersRepo.save(user);
        if(res){
        return {
            message:"User created successfully",
            CreateUserDTO
        }
        }else{
        return {
            message:"User creation failed",
            CreateUserDTO
        }
        }
    }
}
