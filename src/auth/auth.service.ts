import { AuthSchProfile } from '@kir-dev/passport-authsch'
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { UsersService } from '../users/users.service'
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreateUser(oAuthUser: AuthSchProfile): Promise<UserEntity> {
    try {
      const user = await this.usersService.findByAuthSchId(oAuthUser.authSchId)
      if (user) {
        return user
      }

      const newUser = await this.usersService.create({
        authSchId: oAuthUser.authSchId,
        firstName: oAuthUser.firstName,
        fullName: oAuthUser.fullName,
        email: oAuthUser.email,
      })

      this.logger.log(`User #${newUser.id} created`)

      return newUser
    } catch (e) {
      this.logger.error('Unexpected error during user creation', e)
      throw new InternalServerErrorException(
        'Unexpected error during user creation. Please contact Kir-Dev.',
      )
    }
  }

  login(user: User): { jwt: string } {
    return {
      jwt: this.jwtService.sign(user, {
        secret: process.env.JWT_SECRET,
        expiresIn: '2 days',
      }),
    }
  }
}
