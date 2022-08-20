import { OmitType } from '@nestjs/swagger'
import { UserDto } from 'src/users/dto/User.dto'

export class CreateUserDto extends OmitType(UserDto, ['id']) {}
