import { OmitType } from '@nestjs/swagger'
import { UserEntity } from 'src/users/dto/UserEntity.dto'

export class CreateUserDto extends OmitType(UserEntity, ['id', 'isAdmin']) {}
