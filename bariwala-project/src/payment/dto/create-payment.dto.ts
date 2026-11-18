import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Bill } from "../../billing/entities/bill.entity.js";
import { Users } from "../../users/entities/users.entity.js";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example:1,
        description:"The payment is assigned to specific bill id"
    })
    bill_id:number;
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        example:17200,
        description:"Payment is an specific ammount"
    })
    amount:number;
    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example:true,
        description:"The bill is paid or not"
    })
    is_paid:boolean=false;
}
