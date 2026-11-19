
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  Matches
} from 'class-validator';

export class CreateFamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  relationship: string;

  @IsOptional()
  @IsString()
  @Matches(/^01[0-9]{9}$/, { message: 'Phone must be a valid 11-digit Bangladeshi number'})
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;
}
