import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, isNumber, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateBillDto{
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @ApiProperty({
        example:1,
        description:"The bill should be assigned to each flat"
    })
    flat_id:number
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example:'November',
        description:"The bill of the mentioned month"
    })
    month:string;
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example:17800,
        description:"Every flat should have rent"
    })
    rent:number;
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example:1000,
        description:"The gas bill for the specified flat"
    })
    gas:number;
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example:1000,
        description:"The water bill for the specified flat"
    })
    water:number;
    @IsNumber()
    @Min(0)
    @ApiProperty({
        example:1000,
        description:"The electricity bill for the specified flat"
    })
    electricity:number;
    @IsDateString()
    @ApiProperty({
        example:'2026-01-11',
        description:"Every bill has a due date"
    })
    due_date:Date;

}
