import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example:'admin@example.com'
    })
    email:string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example:'Admin121436!'
    })
    password:string;
}
