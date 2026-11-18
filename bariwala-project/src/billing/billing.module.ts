import { Module } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity.js';
import { FlatsModule } from '../flats/flats.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports:[TypeOrmModule.forFeature([Bill]),FlatsModule,AuthModule],
  controllers: [BillingController],
  providers: [BillingService],
  exports:[BillingService]
})
export class BillingModule {}
