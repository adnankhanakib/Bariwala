import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentDto {
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    @ApiProperty({
        example:1,
        description:"The payment is assigned to specific bill id"
    })
    bill_id:number;
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    @ApiProperty({
        example:17200,
        description:"Amount paid in taka; cannot be more than the bill total"
    })
    amount:number;
    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        example:true,
        required:false,
        description:"The bill is paid or not (defaults to false)"
    })
    is_paid?:boolean;
}
