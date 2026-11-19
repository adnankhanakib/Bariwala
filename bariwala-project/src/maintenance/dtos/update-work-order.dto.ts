import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkOrderDTO } from './create-work-order.dto.js';

export class UpdateWorkOrderDTO extends PartialType(CreateWorkOrderDTO) {}