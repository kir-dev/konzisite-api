import { IsNotEmpty } from 'class-validator'
import { UserDto } from 'src/users/dto/User.dto'

export class JwtUserDto extends UserDto {
  @IsNotEmpty()
  iat: number

  @IsNotEmpty()
  exp: number
}
