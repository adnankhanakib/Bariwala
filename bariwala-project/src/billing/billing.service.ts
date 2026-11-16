import { Injectable } from '@nestjs/common';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Bill)
        private readonly billRepo:Repository<Bill>
    ){}
    create(dto:CreateBillDto){
        return "OK"
    }
    deleteBill(id:number){

    }
}
