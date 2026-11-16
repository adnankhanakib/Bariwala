import { isNumber, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBillDto{
    @IsNumber()
    id:number;
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
    @IsNumber()
    due_date:string;

}