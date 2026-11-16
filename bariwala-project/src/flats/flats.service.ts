import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flat } from './entities/flat.entity.js';
import { Repository } from 'typeorm';
import { CreateFlatDTO } from './dtos/create-flat.dto.js';
import { UsersService } from '../users/users.service.js';
import { Users } from '../users/entities/users.entity.js';

@Injectable()
export class FlatsService {
    constructor(
        @InjectRepository(Flat)
        private readonly flatRepo:Repository<Flat>,
        private readonly usersService:UsersService,
    ){}
    async showAllFlats(){
        const flats = await this.flatRepo.find({
            relations:{owner:true}
        })
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
}
