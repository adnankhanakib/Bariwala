import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import type { Relation } from "typeorm";
import { Users } from "../../users/entities/users.entity.js";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFlatDTO{
    @IsNotEmpty({message:"Flat number is required"})
    @IsString()
    @MaxLength(5)
    @ApiProperty({
        example:"C-8"
    })
    flatNo:string;
    @IsString()
    @MaxLength(50)
    @IsNotEmpty({message:"Address is required"})
    @ApiProperty({
        example:"115 Ahmedbagh, Bashabo"
    })
    address:string;
    @IsNumber()
    @IsNotEmpty({message:"Floor is required"})
    @ApiProperty({
        example:4
    })
    floor:number;
    @IsNumber()
    @IsNotEmpty({message:"Bedrooms number is required"})
    @ApiProperty({
        example:3
    })
    bedrooms:number;
    @IsNumber()
    @IsNotEmpty({message:"Rent is required"})
    @ApiProperty({
        example:25000
    })
    rent:number;
    @IsNotEmpty({message:"Flat must have an owner"})
    @ApiProperty({
        example:1
    })
    owner:number
}