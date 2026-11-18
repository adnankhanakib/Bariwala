import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { UpdateBillDto } from './dtos/update-bill.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@UseGuards(JwtGuard,RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}
  @Roles('owner','admin')
  @Get()
  showBills(@Req() request:any){
    return this.billingService.showBill(request.user.id,request.user.role)
  }
  @Roles('owner','admin')
  @Get(":id")
  getBillByID(@Param('id') id:number, @Req() request:any){
    return this.billingService.getBillByID(id,request.user.id,request.user.role)
  }
  @Roles('owner','admin')
  @Post('/create')
  createBill(@Body() createBillDto:CreateBillDto){
    return this.billingService.create(createBillDto)
  }
  @Roles('owner','admin')
  @Delete('/delete/:id')
  deleteBill(@Param('id') id:number,@Req() request:any){
    return this.billingService.deleteBill(id,request.user.id)
  }
  @Roles('owner','admin')
  @Patch('/update/:id')
  updateBill(@Param('id') id:number, @Body() dto:UpdateBillDto, @Req() request:any){
    return this.billingService.updateBill(id,dto,request.user.id)
  }

}
