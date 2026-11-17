import { Injectable } from '@nestjs/common';

import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UsersService } from '../users/users.service.js';
import { Users } from '../users/entities/users.entity.js';
import { BillingService } from '../billing/billing.service.js';
import { Bill } from '../billing/entities/bill.entity.js';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payRepo:Repository<Payment>,
    private readonly usersService:UsersService,
    private readonly billService:BillingService
  ){}

  async viewPayments(){
    const allPayments=await this.payRepo.find()
    return allPayments
  }
  async createPayment(dto:CreatePaymentDto,reqID:number){
    const {bill_id,received_by,...exemptedDto} = dto
    const rcv_by = await this.usersService.getUserByID(received_by) as Users
    const bill = await this.billService.getBillByID(bill_id,reqID,"owner") as Bill
    const newPayment = await this.payRepo.create({
      ...dto,
      received_by:rcv_by,
      bill_id:bill
    })
  }
  async editPayment(paymentID:number,dto:UpdatePaymentDto){
    // const {bill_id,...restFields} = dto
    // const bill = await this.billService.getBillByID() as Bill
    // return this.payRepo.update(paymentID,dto)
  }
}
