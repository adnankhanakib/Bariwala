import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { MaintenancePriority } from '../enums/maintenance-priority.enum.js';

export class CreateWorkOrderDTO {
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(100)
    title: string;
    @IsOptional()
    @IsString()
    workDescription?: string;
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    assignedToUserId?: number;
    @IsOptional()
    @IsEnum(MaintenancePriority, { message: 'Priority must be low, medium, high or urgent' })
    priority?: MaintenancePriority;
    @IsOptional()
    @IsDateString()
    scheduledDate?: string;
}