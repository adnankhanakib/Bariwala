import {
  IsInt,
  IsNumber,
  IsPositive,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateExpenseDto {
  @IsInt()
  flatId: number;

  @IsInt()
  vendorId: number;

  @IsOptional()
  @IsInt()
  workOrderId?: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  expenseDate: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  receiptReference?: string;
}