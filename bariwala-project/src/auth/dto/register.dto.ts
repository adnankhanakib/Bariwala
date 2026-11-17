import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterUserDTO{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    @ApiProperty({
        example:'New User'
    })
    name:string;
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        example:'demo@example.com'
    })
    email:string;
    @IsString()
    @Matches(/^01[3-9]\d{8}$/, {
        message: 'phone must be a valid Bangladeshi number like 01712345678',
    })
    @ApiProperty({
        example:'01997753452'
    })
    phone:string;
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(50)
    @ApiProperty({
        example:'Adnan121436!'
    })
    password:string;
    @IsString()
    @IsOptional()
    @IsIn(['owner','admin','tenant'])
    @ApiProperty({
        example:'tenant',
        description:'Only tenant can be registred via this endpoint'
    })
    role:string='tenant';
}