import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { CreateBillDto } from './dtos/create-bill.dto.js';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}
  @Post('/create')
  createBill(@Body() createBillDto:CreateBillDto){
    return this.billingService.create(createBillDto)
  }
  // localhost:3000/bill
  @Patch(':id')
  async patchByID(@Param('id') id:number,@Body()id:updateBillDto){
    return this.billingService.updateBill(id,bill)
  }
  @Delete(':id')
  async deleteByID(@Param('id')id:number){
    return this.billingService.deleteBill(id)
  }
  @Get('/pay/:id')
  payBill(@Param('id') id:number){
    return this.billingService.payBill(id)
  }

}
