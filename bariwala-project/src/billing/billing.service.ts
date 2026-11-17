import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity.js';
import { Repository } from 'typeorm';
import { UpdateBillDto } from './dtos/update-bill.dto.js';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepo:Repository<Bill>
    ){}
    async create(dto:CreateBillDto){
        const newBill = await this.billRepo.create({
            ...dto,
            total:dto.electricity+dto.gas+dto.rent+dto.water
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
    async showBill(){
        const bills = this.billRepo.find()
        return bills
    }
    async getBillByID(id:number){
        const bill = await this.billRepo.findOneBy({id:id})
        return bill
    }
    async deleteBill(id:number){
        const result = await this.billRepo.delete(id)
        if(result.affected){
            return {
                message:`Bill ID ${id} has been deleted`,
                billInfo:this.getBillByID(id)
            }
        }
    }
    async updateBill(id:number, dto:UpdateBillDto){
        const result = await this.billRepo.update(id,dto)
        if(result.affected){
            return{
                message:`Bill ID ${id} has been updated`,
                billInfo:dto
            }
        }
    }
}
