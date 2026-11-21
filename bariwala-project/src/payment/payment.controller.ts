import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { ApiBearerAuth } from '@nestjs/swagger';
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("create")
  @Roles('owner', 'admin')
  create(@Body() createPaymentDto: CreatePaymentDto,@Req() request:any) {
    return this.paymentService.createPayment(createPaymentDto, request.user.id, request.user.role);
  }
  @Post("pay/:billId")
  @Roles('tenant', 'owner', 'admin')
  payBill(@Param("billId", ParseIntPipe) billId:number, @Req() request:any){
    return this.paymentService.payBill(billId, request.user.id, request.user.role)
  }
  @Patch(":id")
  @Roles('owner', 'admin')
  editPayment(@Param("id", ParseIntPipe) id:number, @Body() update:UpdatePaymentDto,@Req() request:any){
    return this.paymentService.editPayment(id, update, request.user.id, request.user.role)
  }
  @Delete(":id")
  @Roles('owner', 'admin')
  deletePayment(@Param("id", ParseIntPipe) id:number,@Req() request:any){
    return this.paymentService.deletePayment(id, request.user.id, request.user.role)
  }
  @Get(":id")
  @Roles('owner', 'admin')
  getPayment(@Param("id", ParseIntPipe) id:number,@Req() request:any){
    return this.paymentService.getPaymentByID(id, request.user.id, request.user.role)
  }
  @Get()
  @Roles('owner', 'admin')
  getAllPayment(@Req() request:any){
    return this.paymentService.viewPayments(request.user.id, request.user.role)
  }

}
