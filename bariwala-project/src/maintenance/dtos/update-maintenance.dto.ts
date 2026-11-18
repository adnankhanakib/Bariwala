import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceDTO } from './create-maintenance.dto.js';


export class UpdateMaintenanceDTO extends PartialType(
    OmitType(CreateMaintenanceDTO, ['flatId'] as const),
) {}