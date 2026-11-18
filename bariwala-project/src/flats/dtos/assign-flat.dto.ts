import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class AssignFlatOwnerDTO{
    @IsInt()
    @IsNotEmpty()
    @ApiProperty({
        example:1,
        description:"User ID to assign as tenant with the flat"
    })
    userID:number
}