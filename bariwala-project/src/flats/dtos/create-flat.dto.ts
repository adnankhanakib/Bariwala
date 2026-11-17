import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import type { Relation } from "typeorm";
import { Users } from "../../users/entities/users.entity.js";

export class CreateFlatDTO{
    @IsNotEmpty({message:"Flat number is required"})
    @IsString()
    @MaxLength(5)
    flatNo:string;
    @IsString()
    @MaxLength(50)
    @IsNotEmpty({message:"Address is required"})
    address:string;
    @IsNumber()
    @IsNotEmpty({message:"Floor is required"})
    floor:number;
    @IsNumber()
    @IsNotEmpty({message:"Bedrooms number is required"})
    bedrooms:number;
    @IsNumber()
    @IsNotEmpty({message:"Rent is required"})
    rent:number;
    @IsNotEmpty({message:"Flat must have an owner"})
    owner:number
}