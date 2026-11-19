import { PartialType } from '@nestjs/swagger';
import { CreateProfileUpdateRequestDto } from './create-profile_update_request.dto.js';

export class UpdateProfileUpdateRequestDto extends PartialType(CreateProfileUpdateRequestDto) {}
