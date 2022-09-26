import { IsNotEmpty } from 'class-validator'
import { UserEntity } from 'src/users/dto/UserEntity.dto'

export class JwtUserDto extends UserEntity {
  @IsNotEmpty()
  iat: number

  @IsNotEmpty()
  exp: number
}
