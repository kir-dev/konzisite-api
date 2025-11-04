import {
  AuthSchProfile,
  AuthSchScope,
  Strategy,
} from '@kir-dev/passport-authsch'
import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { AuthService } from './auth.service'

@Injectable()
export class AuthschStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(AuthschStrategy.name)
  constructor(private authService: AuthService) {
    super({
      clientId: process.env.AUTHSCH_CLIENT_ID,
      clientSecret: process.env.AUTHSCH_CLIENT_SECRET,
      scopes: [AuthSchScope.PROFILE, AuthSchScope.EMAIL],
      redirectUri: `${process.env.BACKEND_HOST}/auth/callback`,
    })
  }

  async validate(userProfile: AuthSchProfile): Promise<UserEntity> {
    const dbUser = await this.authService.findOrCreateUser(userProfile)
    this.logger.debug('DbUser in validate' + JSON.stringify(dbUser, null, 2))
    return dbUser
  }
}
