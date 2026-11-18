import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UsersService } from '../users/users.service.js';
import { Users } from '../users/entities/users.entity.js';
import { BillingService } from '../billing/billing.service.js';
import { randomInt } from 'crypto';

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
  async getPaymentByID(payID:number){
    const allPayments=await this.payRepo.findOneBy({
      payment_id:payID
    })
    return allPayments
  }
  async createPayment(dto:CreatePaymentDto,reqID:number,role:string){
    const {bill_id,...exemptedDto} = dto
    const bill = await this.billService.getBillByID(bill_id,reqID,role)
    const receipt_no = randomInt(100000,1000000)
    const newPayment = await this.payRepo.create({
      ...dto,
      bill_id:bill,
      receipt_no:receipt_no
    })
    const result = await this.payRepo.save(newPayment)
    if(result){
      return {
        message:`Payment created successfully for bill ID ${bill.id}`
      }
    }
    throw new InternalServerErrorException("Something went wrong while pushing data into database")
  }
  async editPayment(paymentID: number, dto: UpdatePaymentDto, reqID: number) {
    const payment = await this.payRepo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.bill_id', 'bill')
      .innerJoin('bill.flat', 'flat')
      .innerJoin('flat.owner', 'owner')
      .where('payment.payment_id = :paymentID', { paymentID })
      .andWhere('owner.id = :ownerID', { ownerID: reqID })
      .getOne();


    if (!payment) {
      throw new NotFoundException(`Payment ${paymentID} not found`);
    }

    const { bill_id, amount, is_paid } = dto;

    if (bill_id !== undefined) {
      payment.bill_id = await this.billService.getBillByID(
        bill_id,
        reqID,
        'owner',
      );
    }

    if (amount !== undefined) payment.amount = amount;
    if (is_paid !== undefined) payment.is_paid = is_paid;

    return this.payRepo.save(payment);
  }
  async deletePayment(paymentID:number, dto:UpdatePaymentDto, reqID:number){
    const payment=await this.payRepo
     .createQueryBuilder('payment')
     .innerJoinAndSelect('payment.bill_id','bill')
     .innerJoin('bill.flat','flat')
     .innerJoin('flat.owner','owner')
     .where('payment.payment_id= :paymentID',{paymentID})
     .andWhere('owner.id=:ownerID',{ownerID:reqID})
     .getOne();
    
    if(!payment){
     throw new NotFoundException(`Payment ${paymentID} not found`);
    }
     await this.payRepo.delete(payment);
     return { message: 'Payment deleted succeessfully'};
  }
}
