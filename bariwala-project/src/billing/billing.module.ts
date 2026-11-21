import { Module } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { Payment } from '../payment/entities/payment.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Bill, Flat, Payment])],
  controllers: [BillingController],
  providers: [BillingService],
  exports:[BillingService]
})
export class BillingModule {}
