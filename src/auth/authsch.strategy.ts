import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-oauth2'
import { firstValueFrom } from 'rxjs'
import { AuthService } from './auth.service'
import { OAuthUser } from './oauthuser'

const AUTH_SCH_URL = 'https://auth.sch.bme.hu'

@Injectable()
export class AuthschStrategy extends PassportStrategy(Strategy, 'authsch') {
  private readonly logger = new Logger(AuthschStrategy.name)
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: `${AUTH_SCH_URL}/site/login`,
      tokenURL: `${AUTH_SCH_URL}/oauth2/token`,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/callback',
      scope: ['basic', 'sn', 'givenName', 'mail'], // ?? niifEduPersonAttendedCourse = hallgatott tárgyak
      // Hallgató által jelenleg hallgatott kurzusok kódjai. Példa: "BMEVIAUA218;BMEVIIIA316"
    })
  }

  async validate(accessToken: string): Promise<{ jwt: string }> {
    const responseUser: OAuthUser = (
      await firstValueFrom(
        this.httpService.get(
          `${AUTH_SCH_URL}/api/profile?access_token=${accessToken}`,
        ),
      )
    ).data

    const dbUser = await this.authService.validateUser(responseUser)
    this.logger.debug('DbUser in validate' + JSON.stringify(dbUser, null, 2))

    return this.authService.login(dbUser)
  }
}
