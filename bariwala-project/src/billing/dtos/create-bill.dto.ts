import { IsDateString, isNumber, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class CreateBillDto{
    @IsString()
    month:string;
    @IsNumber()
    rent:number;
    @IsNumber()
    gas:number;
    @IsNumber()
    water:number;
    @IsNumber()
    electricity:number;
    @IsDateString()
    due_date:Date;

}