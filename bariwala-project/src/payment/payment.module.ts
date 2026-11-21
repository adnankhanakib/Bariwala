import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentController } from './payment.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity.js';
import { BillingModule } from '../billing/billing.module.js';
import { Bill } from '../billing/entities/bill.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Payment, Bill]), BillingModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
