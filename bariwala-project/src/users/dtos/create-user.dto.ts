import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO{
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name:string;
    @IsEmail()
    @IsNotEmpty()
    email:string;
    @IsString()
    @Matches(/^01[3-9]\d{8}$/, {
        message: 'phone must be a valid Bangladeshi number like 01712345678',
    })
    phone:string;
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(50)
    password:string;
    @IsString()
    @IsOptional()
    @IsIn(['owner','admin','tenant'])
    role:string='owner';
}