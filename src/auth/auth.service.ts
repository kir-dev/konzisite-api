import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { UsersService } from '../users/users.service'
import { OAuthUser } from './oauthuser'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async findOrCreateUser(oAuthUser: OAuthUser): Promise<User> {
    const user = await this.usersService.findByAuthSchId(oAuthUser.internal_id)
    if (user) {
      return user
    }

    const newUser = await this.usersService.create({
      authSchId: oAuthUser.internal_id,
      firstName: oAuthUser.givenName,
      fullName: oAuthUser.displayName,
      email: oAuthUser.mail,
    })

    this.logger.log(`User #${newUser.id} created`)

    return newUser
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
