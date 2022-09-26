import { OmitType, PartialType } from '@nestjs/swagger'
import { UserEntity } from './UserEntity.dto'

export class UpdateUserDto extends PartialType(
  OmitType(UserEntity, ['id', 'authSchId']),
) {}
