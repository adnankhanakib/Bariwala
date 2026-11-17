import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flat } from './entities/flat.entity.js';
import { Repository } from 'typeorm';
import { CreateFlatDTO } from './dtos/create-flat.dto.js';
import { UsersService } from '../users/users.service.js';
import { Users } from '../users/entities/users.entity.js';
import { UpdateFlatDTO } from './dtos/update-flat.dto.js';
import { AssignFlatOwnerDTO } from './dtos/assign-flat.dto.js';

@Injectable()
export class FlatsService {
    constructor(
        @InjectRepository(Flat)
        private readonly flatRepo:Repository<Flat>,
        private readonly usersService:UsersService,
    ){}
    async showAllFlats(ownerID:number,role:string){
        var flats;
        if(role=='admin'){
            flats = await this.flatRepo.find({
                relations:{owner:true}
            })
        }else{
            flats = await this.flatRepo.find({
                where:{
                    owner:{
                        id:ownerID
                    }
                },
                relations:{owner:true}
            })
        }
        if(flats.length==0){
            return {
                totalFlats:0,
                message:"No flats found"
            }
        }
        const flatData = flats.map((flat)=>({
            flatID:flat.id,
            flatNumber:flat.flatNo,
            address:flat.address,
            floor:flat.floor,
            flatInformation:{
                bedrooms:flat.bedrooms,
                rent:flat.rent,
                owner:flat.owner.name+` (${flat.owner.phone})`
            }
        }))

        return {
            message:"Flats fetched successfully",
            totalFlats:flats.length,
            data:flatData
        }
    }
    async showFlatByOwnerID(ownerID:number){
        const flats = await this.flatRepo.find({
            where:{
                owner:{
                    id:ownerID
                }
            },
            relations:{
                owner:true
            }
        })
        if(flats.length==0){
            return {
                message:`No flats found with owner ID ${ownerID}`
            }
        }
        return {
            message:`Flats fetched successfully for ID ${ownerID}`,
            totalFlats:flats.length,
            flats:flats
        }
    }
    async getFlatbyID(id:number){
        return await this.flatRepo.findOne({
            where:{
                id:id
            }
        })
    }
    async createFlat(flatInfo:CreateFlatDTO){
        const owner = await this.usersService.getUserByID(flatInfo.owner) as Users
        if(owner==null){
            return{
                message:"Owner doesn't exists"
            }
        }
        const sameOwner = await this.flatRepo.findOne({
            where:{
                owner:{id:owner.id},
                flatNo:flatInfo.flatNo,
                address:flatInfo.address
            }
        })
        if(sameOwner){
            return {
                message:"Similar flat ID is already connected with the owner",
                flatNo:flatInfo.flatNo
            }
        }
        const sameFlat = await this.flatRepo.findOne({
            where:{
                flatNo:flatInfo.flatNo,
                address:flatInfo.address
            }
        })
        if(sameFlat){
            return {
                message:"Same address can't have multiple flats with same flat number",
                flatNo:flatInfo.flatNo
            }
        }
        const flat = this.flatRepo.create({
            ...flatInfo,
            owner: owner
        })
        const res= await this.flatRepo.save(flat)
        if(!res){
            throw new InternalServerErrorException("Something went wrong")
        }
        return {
            message:"Flat created successfully",
            flatInformation:{
                flatNumber:res.flatNo,
                address:res.address,
                floor:res.floor,
            },
            ownerInformation:{
                name:owner.name,
                contact:owner.phone
            }
        }
    }

    async deleteFlat(flatID:number){
        const check = await this.flatRepo.findOneBy({id:flatID})
        if(!check){
            throw new NotFoundException(`Flat not found with ID ${flatID}`)
        }
        const deleted = (await this.flatRepo.delete(flatID)).affected
        if(deleted){
            return {
                message:`Flat ID ${flatID} successfully deleted`
            }
        }
        throw new InternalServerErrorException("Something went wrong")
    }

    async flatInformation(flatID:number){
        const check = await this.flatRepo.findOne({
            where:{
                id:flatID
            },
            relations:{
                owner:true
            }
        })
        if(!check){
            throw new NotFoundException(`Flat ID ${flatID} not found`)
        }
        const {owner,...otherFields} = check;
        return {
            flatInformation:otherFields,
            ownerInformation:{
                name:check.owner.name,
                contact:check.owner.phone
            }
        }
    }
    async updateFlat(flatID:number, editDTO:UpdateFlatDTO){
        const flat = await this.flatRepo.findOne({
            where:{id:flatID}
        })
        if(!flat){
            throw new NotFoundException(`Flat not found with id ${flatID}`)
        }
        var result;
        if(editDTO.owner){
            const {owner,...flatFields} = editDTO
            const newOwner = await this.usersService.getUserByID(owner) as Users
            result = await this.flatRepo.update(flatID,{
                ...flatFields,
                owner:newOwner
            })
            if(result.affected){
                return {
                    message:`Flat ID ${flatID} has been updated successfully`,
                    updatedInformation:{
                        ...flatFields,
                        ownerInformation:{
                            name:newOwner.name,
                            phone:newOwner.phone
                        }
                    }
                }
            }
        }else{
            const {owner,...flatFields} = editDTO
            result = await this.flatRepo.update(flatID,flatFields)
            if(result.affected){
                return {
                    message:`Flat ID ${flatID} has been updated successfully`,
                    updatedInformation:flatFields
                }
            }
        }
    }
    async assignTenant(flatID:number,dto:AssignFlatOwnerDTO,loggedUserID:number,role:string){
        const user = await this.usersService.getUserByID(dto.userID)
        var flat;
        if(role=="admin"){
            flat = await this.flatRepo.findOne({
                where:{
                    id:flatID
                },
                relations:{
                    tenant:true
                }
            })
        }else if(role=="owner"){
            flat = await this.flatRepo.findOne({
                where:{
                    id:flatID,
                    owner:{
                        id:loggedUserID
                    }
                },
                relations:{
                    tenant:true
                }
            })
        }
        if(!flat){
            throw new NotFoundException(`No flat found with ID ${flatID}`)
        }
        if(flat.tenant){
            throw new ConflictException(`Tenant already exists on flat number ${flat.flatNo}`)
        }
        if(!user){
            throw new NotFoundException(`No user found with ID ${dto.userID}`)
        }
        const todayDate = new Date()
        const x = await this.flatRepo.update(flatID,{
            tenant:user,
            tenantJoinDate:todayDate
        })
        if(x.affected){
            return {
                message:"Tenant updated successfully",
                flatInformation:{
                    flatNumber: flat.flatNo,
                    floor:flat.floor,
                    address:flat.address,
                    tenantInformation:{
                        name:user.name,
                        contact:user.phone
                    },
                    tenantJoinDate:todayDate
                }
            }
        }
    }
    async evicateTenant(flatID:number,loggedUserID:number,role:string){
        var flat;
        if(role=="admin"){
            flat = await this.flatRepo.findOne({
                where:{
                    id:flatID
                },
                relations:{
                    tenant:true
                }
            })
        }else if(role=="owner"){
            flat = await this.flatRepo.findOne({
                where:{
                    id:flatID,
                    owner:{
                        id:loggedUserID
                    }
                },
                relations:{
                    tenant:true
                }
            })
        }
        if(!flat){
            throw new NotFoundException(`No flat found with ID ${flatID}`)
        }
        if(!flat.tenant){
            throw new ConflictException(`No tenant lives on flat number ${flat.flatNo}`)
        }
        const x = await this.flatRepo.update(flatID,{
            tenant:null,
            tenantJoinDate:null
        })
        if(x.affected){
            return {
                message:"Tenant evicated successfully",
                flatInformation:{
                    flatNumber: flat.flatNo,
                    floor:flat.floor,
                    address:flat.address,
                }
            }
        }
    }
    async getAllTenants(ownerID:number,role:string){
        var flats
        if(role=="admin"){
            flats = await this.flatRepo.find({relations:{
                tenant:true
            }})
        }else{
            flats = await this.getTenantsByOwner(ownerID)
            return flats
        }
        return flats.map((flat)=>({
            flatID:flat.id,
            flatNumber:flat.flatNo,
            tenant:flat.tenant?{
                id:flat.tenant.id,
                name:flat.tenant.name,
                contact:flat.tenant.phone
            }:null
        }))
    }
    async getTenantsByOwner(OwnerID:number){
        const flats = await this.flatRepo.find({
            where:{
                owner:{id:OwnerID}
            },
            relations:{
                tenant:true,
            },
            select:{
                id:true,
                flatNo:true,
                tenant:{
                    id:true,
                    name:true,
                    phone:true
                }
            }
        })
        if(flats.length==0){
            return{
                message:"No flats found with matching owner ID"
            }
        }
        return flats.map((flat)=>({
            flatID:flat.id,
            flatNumber:flat.flatNo,
            tenant:flat.tenant?{
                id:flat.tenant.id,
                name:flat.tenant.name,
                contact:flat.tenant.phone
            }:null
        }))
    }
}
