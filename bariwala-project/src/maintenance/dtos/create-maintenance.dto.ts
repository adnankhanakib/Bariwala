import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MaintenanceCategory } from '../enums/maintenance-category.enum.js';

export class CreateMaintenanceDTO {
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(100)
    title: string;
    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description: string;
    @IsEnum(MaintenanceCategory, { message: 'Category must be PLUMBING, ELECTRICAL, GAS or OTHER' })
    category: MaintenanceCategory;
}