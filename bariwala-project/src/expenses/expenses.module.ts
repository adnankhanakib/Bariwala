import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExpensesController } from './expenses.controller.js';
import { ExpensesService } from './expenses.service.js';

import { Expense } from './entities/expense.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { Vendor } from '../vendors/entities/vendor.entity.js';
import { Users } from '../users/entities/users.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Flat, Vendor, Users]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}