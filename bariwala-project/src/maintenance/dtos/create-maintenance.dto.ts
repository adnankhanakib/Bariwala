import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { MaintenancePriority } from '../enums/maintenance-priority.enum.js';

export class CreateMaintenanceDTO {
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    flatId: number;
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(100)
    title: string;
    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description: string;
    @IsOptional()
    @IsEnum(MaintenancePriority, { message: 'Priority must be low, medium, high or urgent' })
    priority?: MaintenancePriority;
}