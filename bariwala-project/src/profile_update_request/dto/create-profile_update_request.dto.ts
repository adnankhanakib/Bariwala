
import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  IsObject,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateProfileUpdateRequestDto {
  @IsIn([
    'profile',
    'family_add',
    'family_update',
    'family_delete',
  ])
  requestType: string;

  @ValidateIf((o) => o.requestType === 'profile')
  @IsOptional()
  @IsString()
  @MaxLength(100)
  requestedName?: string;

  @ValidateIf((o) => o.requestType === 'profile')
  @IsOptional()
  @Matches(/^01[0-9]{9}$/, {
    message: 'Phone must be a valid 11-digit Bangladeshi number',
  })
  requestedPhone?: string;

  @ValidateIf((o) =>
    ['family_update', 'family_delete'].includes(o.requestType),
  )
  @IsInt()
  familyMemberId?: number;

  @ValidateIf((o) =>
    ['family_add', 'family_update'].includes(o.requestType),
  )
  @IsObject()
  requestedChanges?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
