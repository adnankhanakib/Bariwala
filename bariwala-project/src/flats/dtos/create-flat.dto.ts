import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from "class-validator";
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
    @IsInt()
    @Min(0)
    @IsNotEmpty({message:"Floor is required"})
    @ApiProperty({
        example:4
    })
    floor:number;
    @IsInt()
    @Min(1)
    @IsNotEmpty({message:"Bedrooms number is required"})
    @ApiProperty({
        example:3
    })
    bedrooms:number;
    @IsInt()
    @Min(1)
    @IsNotEmpty({message:"Rent is required"})
    @ApiProperty({
        example:25000
    })
    rent:number;
    @IsNotEmpty({message:"Flat must have an owner"})
    @ApiProperty({
        example:1,
        description:"Owner user id. Owners can only use their own id; admins can pick any owner."
    })
    @IsInt()
    owner:number
}
