import { IsOptional } from 'class-validator'
import { UserEntity } from './UserEntity.dto'

export class UserProfileDto extends UserEntity {
  @IsOptional()
  jwt?: string
}
