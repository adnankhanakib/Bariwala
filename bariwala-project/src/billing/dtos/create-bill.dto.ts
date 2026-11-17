import { IsDateString, IsNotEmpty, isNumber, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateBillDto{
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    flat_id:number
    @IsString()
    @IsNotEmpty()
    month:string;
    @IsNumber()
    @Min(0)
    rent:number;
    @IsNumber()
    @Min(0)
    gas:number;
    @IsNumber()
    @Min(0)
    water:number;
    @IsNumber()
    @Min(0)
    electricity:number;
    @IsDateString()
    due_date:Date;

}