
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Expense } from './entities/expense.entity.js';
import { Flat } from '../flats/entities/flat.entity.js';
import { Vendor } from '../vendors/entities/vendor.entity.js';
import { Users } from '../users/entities/users.entity.js';

import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,

    @InjectRepository(Flat)
    private flatRepository: Repository<Flat>,

    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,

    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  // Create Expense
  async create(
    createExpenseDto: CreateExpenseDto,
    recordedByUserId: number,
    role: string,
  ) {
    const flat = await this.flatRepository.findOne({
      where: { id: createExpenseDto.flatId },
      relations: { owner: true },
    });

    if (!flat) {
      throw new NotFoundException('Flat not found');
    }

    if (role !== 'admin' && flat.owner.id !== recordedByUserId) {
      throw new ForbiddenException(
        'You cannot create expenses for another owner flat',
      );
    }

    const vendor = await this.vendorRepository.findOneBy({
      id: createExpenseDto.vendorId,
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (!vendor.isActive) {
      throw new BadRequestException('Vendor is inactive');
    }

    const user = await this.userRepository.findOneBy({
      id: recordedByUserId,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expense = this.expenseRepository.create({
      flat,
      vendor,
      recordedBy: user,
      workOrderId: createExpenseDto.workOrderId ?? null,
      amount: String(createExpenseDto.amount),
      expenseDate: new Date(createExpenseDto.expenseDate),
      description: createExpenseDto.description,
      receiptReference: createExpenseDto.receiptReference ?? null,
    });

    return this.expenseRepository.save(expense);
  }

  // Get All Expenses
  async findAll(role: string, userId: number) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.flat', 'flat')
      .leftJoinAndSelect('flat.owner', 'owner')
      .leftJoinAndSelect('expense.vendor', 'vendor')
      .leftJoinAndSelect('expense.recordedBy', 'recordedBy');

    if (role !== 'admin') {
      query.where('owner.id = :userId', { userId });
    }

    return query.getMany();
  }

  // Get Expense by ID
  async findOne(id: number, role: string, userId: number) {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.flat', 'flat')
      .leftJoinAndSelect('flat.owner', 'owner')
      .leftJoinAndSelect('expense.vendor', 'vendor')
      .leftJoinAndSelect('expense.recordedBy', 'recordedBy')
      .where('expense.id = :id', { id });

    if (role !== 'admin') {
      query.andWhere('owner.id = :userId', { userId });
    }

    const expense = await query.getOne();

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  // Update Expense
  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
    role: string,
    userId: number,
  ) {
    const expense = await this.findOne(id, role, userId);

    if (updateExpenseDto.flatId !== undefined) {
      const flat = await this.flatRepository.findOne({
        where: { id: updateExpenseDto.flatId },
        relations: { owner: true },
      });

      if (!flat) {
        throw new NotFoundException('Flat not found');
      }

      if (role !== 'admin' && flat.owner.id !== userId) {
        throw new ForbiddenException(
          'You cannot move expenses to another owner flat',
        );
      }

      expense.flat = flat;
    }

    if (updateExpenseDto.vendorId !== undefined) {
      const vendor = await this.vendorRepository.findOneBy({
        id: updateExpenseDto.vendorId,
      });

      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }

      if (!vendor.isActive) {
        throw new BadRequestException('Vendor is inactive');
      }

      expense.vendor = vendor;
    }

    if (updateExpenseDto.amount !== undefined) {
      expense.amount = String(updateExpenseDto.amount);
    }

    if (updateExpenseDto.expenseDate !== undefined) {
      expense.expenseDate = new Date(updateExpenseDto.expenseDate);
    }

    if (updateExpenseDto.description !== undefined) {
      expense.description = updateExpenseDto.description;
    }

    if (updateExpenseDto.receiptReference !== undefined) {
      expense.receiptReference = updateExpenseDto.receiptReference;
    }

    if (updateExpenseDto.workOrderId !== undefined) {
      expense.workOrderId = updateExpenseDto.workOrderId;
    }

    return this.expenseRepository.save(expense);
  }
}
