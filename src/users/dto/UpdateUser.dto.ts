import { OmitType, PartialType } from '@nestjs/swagger'
import { UserDto } from './User.dto'

export class UpdateUserDto extends PartialType(
  OmitType(UserDto, ['id', 'authSchId']),
) {}
