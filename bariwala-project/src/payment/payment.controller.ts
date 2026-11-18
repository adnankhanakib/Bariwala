import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("create")
  create(@Body() createPaymentDto: CreatePaymentDto,@Req() request:any) {
    return this.paymentService.createPayment(
      createPaymentDto,
      request.user.id,
      request.user.role,
    );
  }
  @Patch(":id")
  editPayment(@Param("id") id:number, @Body() update:UpdatePaymentDto,@Req() request:any){
    return this.paymentService.editPayment(id,update,request.user.id)
  }
  @Delete(":id")
  deletePayment(@Param(":id") id:number,@Body() update:UpdatePaymentDto,@Req() request:any){
    return this.paymentService.editPayment(id,update,request.user.id)
  }
  @Get(":id")
  getPayment(@Param(":id") id:number){
    return this.paymentService.getPaymentByID(id)
  }
  @Get()
  getAllPayment(){
    return this.paymentService.viewPayments()
  }

}
