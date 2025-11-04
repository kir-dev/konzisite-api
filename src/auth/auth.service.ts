import { AuthSchProfile } from '@kir-dev/passport-authsch'
import { Injectable, Logger } from '@nestjs/common'
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
      let user = await this.usersService.findByAuthSchId(oAuthUser.authSchId)
      if (user) {
        return user
      }

      // For some reason, the authSchId of some of our users got mixed up.
      // So if we can't find their user based on the authSchId, we try looking for a user with their email.
      // But only if they verified their email in authSch, to make sure that you can't steal the account of others
      if (oAuthUser.emailVerfied) {
        user = await this.usersService.findByEmail(oAuthUser.email)
        if (user) {
          // we also update the authSchId in the DB
          const updatedUser = await this.usersService.updateAuthSchId(
            oAuthUser.email,
            oAuthUser.authSchId,
          )
          this.logger.warn(
            `AuthSchId for user with email ${oAuthUser.email} has changed from ${user.authSchId} to ${updatedUser.authSchId}!`,
          )
          return updatedUser
        }
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
      this.logger.error('Unexpected error during user creation', e, oAuthUser)
      // essentially throwing a 401
      return null
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
