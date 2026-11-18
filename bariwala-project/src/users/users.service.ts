import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/users.entity.js';
import { CreateUserDTO } from './dtos/create-user.dto.js';
import { promises } from 'dns';
import { NotFoundError } from 'rxjs';
import { UpdateUserDTO } from './dtos/update-user.dto.js';
import * as bcrypt from 'bcrypt';
import { response } from 'express';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepo:Repository<Users>
    ){}
    async create(newUser:CreateUserDTO):Promise<Object>{
        const existingMail = await this.usersRepo.findOneBy({
            email:newUser.email
        })
        if(existingMail){
            throw new ConflictException(`Email ${newUser.email} already exists`)
        }
        const {password,...userFields} = newUser
        const passwordHash = await bcrypt.hash(newUser.password,10)

        const user = this.usersRepo.create({
            ...userFields,
            passwordHash,
        });
        const res = await this.usersRepo.save(user);
        if(res){
            const {password,...userWithoutPass} = newUser;
            return {
                message:"User created successfully",
                details:userWithoutPass
            }
        }else{
            throw new InternalServerErrorException("Failed to create user")
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
    async getUserByID(id:number):Promise<Users>{
        const user = await this.usersRepo.findOne({
            where:{
                id:id
            },
            select:{
                id:true,
                name:true,
                email:true,
                phone:true,
                role:true,
                createdAt:true,
                updatedAt:true
            }
        })
        if(!user){
            throw new NotFoundException(`No user found with ID ${id}`)
        }
        return user
    }
    async updateUser(id:number,updateUserDTO:UpdateUserDTO):Promise<object>{
        const user = await this.usersRepo.findOne({
            where:{
                id:id
            }
        });
        if(user){
            const submittedMail = updateUserDTO.email
            if(submittedMail){
                const mailCheck = await this.getUserByEmail(submittedMail)
                if(mailCheck && mailCheck.id!=id){
                    throw new ConflictException(`An user already exist with email ${submittedMail}`)
                }
            }
            const res = (await this.usersRepo.update(id,updateUserDTO)).affected;
            if(res) {
                return {
                    message:`User ${id} updated successfully`,
                    updatedInformations:updateUserDTO
                }
            }else{
                throw new InternalServerErrorException(`Failed to update user ${id}`)
            }
        }
        throw new NotFoundException(`No user found with id ${id}`)
    }
    async deleteUser(id:number):Promise<object | string>{
        const user = await this.usersRepo.findOneBy({id:id})
        if(!user){
            throw new NotFoundException(`No user found with id ${id}`)
        }
        const res = (await this.usersRepo.delete(id)).affected;
        if(res){
            return {
                message:`User deleted successfully with ID ${id}`
            }
        }else{
            throw new InternalServerErrorException(`Something went wrong when deleting the user ${id}`)
        }
    }
    async getUserByEmail(email:string):Promise<Users | null>{
        const res = await this.usersRepo.findOneBy({email})
        return res
    }
    async populateDB(){
        const admin:CreateUserDTO ={
            name:'Adnan',
            email:'admin@example.com',
            phone:'01997753452',
            password:'Admin121436!',
            role:'admin'
        }
        const owner:CreateUserDTO={
            name:'Khan',
            email:'owner@example.com',
            phone:'01997753452',
            password:'Demo121436!',
            role:'owner'
        }
        var responseObj = {
            message:"Database populated with these datas",
            owner:owner,
            admin:admin
        }

        const checkAdminDummy = await this.usersRepo.findOneBy({email:admin.email})
        const checkOwnerDummy = await this.usersRepo.findOneBy({email:owner.email})
        if(checkAdminDummy && checkOwnerDummy){
            responseObj.message="Database already populated with these values"
        }else{
            await this.create(admin)
            await this.create(owner)
        }
        return responseObj
    }
}
