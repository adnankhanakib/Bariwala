import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Bill } from "../../billing/entities/bill.entity.js";
import { Users } from "../../users/entities/users.entity.js";

export class CreatePaymentDto {
    bill_id:number;
    received_by:number;
    @IsNumber()
    @IsNotEmpty()
    amount:number;
    @IsNumber()
    @IsNotEmpty()
    receipt_no:number;
    @IsBoolean()
    @IsOptional()
    is_paid:boolean=false;
}
