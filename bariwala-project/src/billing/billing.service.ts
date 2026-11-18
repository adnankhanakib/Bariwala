import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity.js';
import { Repository } from 'typeorm';
import { UpdateBillDto } from './dtos/update-bill.dto.js';
import { NotFoundError } from 'rxjs';
import { FlatsService } from '../flats/flats.service.js';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepo:Repository<Bill>,
        private readonly flatService:FlatsService
    ){}
    async create(dto:CreateBillDto){
        const flat = await this.flatService.getFlatbyID(dto.flat_id)
        if(!flat){
            throw new NotFoundException(`No flat found with ID ${dto.flat_id}`)
        }
        const newBill = await this.billRepo.create({
            ...dto,
            total:dto.electricity+dto.gas+dto.rent+dto.water,
            flat:flat
        })
        const result = await this.billRepo.save(newBill)
        if(result){
            return {
                message:"Bill generated successfully",
                billInformation:result
            }
        }else{
            throw new InternalServerErrorException("Bill creation failed")
        }
    }
    async showBill(ownerID: number,role:string) {
        if(role=="admin"){
            return this.billRepo.find()
        }else if(role=="owner"){
            return this.billRepo
            .createQueryBuilder('bill')
            .leftJoinAndSelect('bill.flat', 'flat')
            .innerJoin('flat.owner', 'owner')
            .where('owner.id = :ownerID', { ownerID })
            .getMany();
        }
    }
    async getBillByID(id: number, reqID: number, role: string) {
        const bill = await this.billRepo.findOne({
            where: { id },
            relations: { flat: { owner: true } },
        });

        if (!bill || (role !== 'admin' && bill.flat?.owner?.id !== reqID)) {
            throw new NotFoundException(`Bill ${id} not found`);
        }

        return bill;
    }
    async deleteBill(id:number,reqID:number){
        const bill = await this.getBillByID(id,reqID,'owner')
        if(!bill){
            throw new NotFoundException("Bill not found")
        }
        const result = await this.billRepo.delete(id)
        if(result.affected){
            return {
                message:`Bill ID ${id} has been deleted`,
                billInfo:bill
            }
        }
    }
    async updateBill(id:number, dto:UpdateBillDto,reqID:number){
        const bill = await this.getBillByID(id,reqID,'owner')
        if(!bill){
            throw new NotFoundException("Bill not found with ID "+id)
        }
        const {flat_id,...billFields} = dto;
        const updatedBill = this.billRepo.merge(bill,billFields)
        var flat;
        if(flat_id!==undefined){
            flat = await this.flatService.getFlatbyID(flat_id)
            if(!flat){
                throw new NotFoundException(`No flat found with ID ${dto.flat_id}`)
            }
            updatedBill.flat = flat
        }
        updatedBill.total = updatedBill.electricity+updatedBill.gas+updatedBill.rent+updatedBill.water
        const result = await this.billRepo.update(id,updatedBill)
        if(result.affected){
            return{
                message:`Bill ID ${id} has been updated`,
                billInfo:dto
            }
        }
    }
}
