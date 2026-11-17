import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { UpdateBillDto } from './dtos/update-bill.dto.js';
import { JwtGuard } from '../auth/jwtGuard.guard.js';
import { RolesGuard } from '../auth/roles/roles.guard.js';
import { Roles } from '../auth/roles/roles.decorator.js';

@UseGuards(JwtGuard,RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}
  @Roles('owner')
  @Get()
  showBills(){
    return this.billingService.showBill()
  }
  @Roles('owner')
  @Get(":id")
  getBillByID(@Param('id') id:number){
    return this.billingService.getBillByID(id)
  }
  @Roles('owner')
  @Post('/create')
  createBill(@Body() createBillDto:CreateBillDto){
    return this.billingService.create(createBillDto)
  }
  @Roles('owner')
  @Delete('/delete/:id')
  deleteBill(@Param('id') id:number){
    return this.billingService.deleteBill(id)
  }
  @Roles('owner')
  @Patch('/update/:id')
  updateBill(@Param('id') id:number, @Body() dto:UpdateBillDto){
    return this.billingService.updateBill(id,dto)
  }

}
