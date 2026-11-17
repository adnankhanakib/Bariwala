import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { CreateBillDto } from './dtos/create-bill.dto.js';
import { UpdateBillDto } from './dtos/update-bill.dto.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}
  @Get()
  showBills(){
    return this.billingService.showBill()
  }
  @Post('/create')
  createBill(@Body() createBillDto:CreateBillDto){
    return this.billingService.create(createBillDto)
  }
  @Delete('/delete/:id')
  deleteBill(@Param() id:number){
    return this.billingService.deleteBill(id)
  }
  @Patch('/update/:id')
  updateBill(@Param() id:number, @Body() dto:UpdateBillDto){
    return this.billingService.updateBill(id,dto)
  }

}
