import { Module } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Bill])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
