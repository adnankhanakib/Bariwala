import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentController } from './payment.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity.js';
import { UsersModule } from '../users/users.module.js';
import { BillingModule } from '../billing/billing.module.js';

@Module({
  imports:[TypeOrmModule.forFeature([Payment]),UsersModule, BillingModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
