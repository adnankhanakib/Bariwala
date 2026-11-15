import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';
import { promises } from 'dns';
import { NotFoundError } from 'rxjs';
import { UpdateUserDTO } from './dtos/update-user.dto.js';

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
    async showAllUsers(): Promise<Users[]>{
        return this.usersRepo.find({
            select:{
                id:true,
                name:true,
                email:true,
                phone:true,
                createdAt:true,
                updatedAt:true
            }
        })
    }
    async getUserByID(id:number):Promise<Users | Object>{
        const user = await this.usersRepo.findOne({
            where:{
                id:id
            },
            select:{
                id:true,
                name:true,
                email:true,
                phone:true,
                createdAt:true,
                updatedAt:true
            }
        })
        if(!user){
            throw new NotFoundException(`No user found with ID ${id}`)
        }
        return {
            message:"User found successfully",
            user
        };
    }
    async updateUser(id:number,updateUserDTO:UpdateUserDTO):Promise<object>{
        const user = await this.usersRepo.findOne({
            where:{
                id:id
            }
        });
        if(user){
            const res = (await this.usersRepo.update(id,updateUserDTO)).affected;
            if(res) {
                return {
                    message:`User ${id} updated successfully`,
                    updatedInformations:updateUserDTO
                }
            }else{
                return {
                    message:`Failed to update user ${id}`
                }
            }
        }
        return {message:`No user found with id ${id}`}
    }
}
