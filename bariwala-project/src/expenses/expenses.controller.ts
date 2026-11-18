
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { ExpensesService } from './expenses.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';

@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles('admin', 'owner')
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() request: any,
  ) {
    return this.expensesService.create(
      createExpenseDto,
      request.user.id,
      request.user.role,
    );
  }

  @Get()
  @Roles('admin', 'owner')
  findAll(@Req() request: any) {
    return this.expensesService.findAll(
      request.user.role,
      request.user.id,
    );
  }

  @Get(':id')
  @Roles('admin', 'owner')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.expensesService.findOne(
      id,
      request.user.role,
      request.user.id,
    );
  }

  @Patch(':id')
  @Roles('admin', 'owner')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() request: any,
  ) {
    return this.expensesService.update(
      id,
      updateExpenseDto,
      request.user.role,
      request.user.id,
    );
  }
}
